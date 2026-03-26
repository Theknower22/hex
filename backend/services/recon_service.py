import socket
import requests
import re
import ssl
import OpenSSL
import concurrent.futures
from datetime import datetime
from typing import Dict, List, Any

class ReconService:
    @staticmethod
    def _clean_target(target: str) -> str:
        """Remove schema and paths from target to get a clean hostname/IP."""
        clean = re.sub(r'^https?://', '', target)
        clean = clean.split('/')[0].split(':')[0]
        return clean

    @staticmethod
    def get_ip_intelligence(target: str) -> Dict[str, Any]:
        """Resolve target and get full geolocation + ISP data from ip-api.com."""
        clean_target = ReconService._clean_target(target)
        try:
            ip = socket.gethostbyname(clean_target)
        except Exception as e:
            return {"error": f"Could not resolve: {str(e)}"}

        try:
            hostname = socket.getfqdn(ip)
        except Exception:
            hostname = ip

        geo = {}
        try:
            geo_res = requests.get(
                f"http://ip-api.com/json/{ip}?fields=status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as",
                timeout=5
            )
            if geo_res.status_code == 200:
                data = geo_res.json()
                if data.get("status") == "success":
                    geo = {
                        "country": data.get("country", ""),
                        "country_code": data.get("countryCode", ""),
                        "region": data.get("regionName", ""),
                        "city": data.get("city", ""),
                        "zip": data.get("zip", ""),
                        "lat": data.get("lat", 0),
                        "lon": data.get("lon", 0),
                        "timezone": data.get("timezone", ""),
                        "isp": data.get("isp", ""),
                        "org": data.get("org", ""),
                        "asn": data.get("as", ""),
                    }
        except Exception as e:
            geo = {"error": f"Geo lookup failed: {str(e)}"}

        return {
            "target": target,
            "ip": ip,
            "hostname": hostname,
            **geo
        }

    @staticmethod
    def enumerate_dns(domain: str) -> List[Dict[str, Any]]:
        """Perform real DNS enumeration using dnspython."""
        try:
            import dns.resolver
            clean_domain = ReconService._clean_target(domain)
            records = []
            record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'CNAME']
            for rtype in record_types:
                try:
                    answers = dns.resolver.resolve(clean_domain, rtype, lifetime=5)
                    for rdata in answers:
                        records.append({"type": rtype, "value": str(rdata)})
                except Exception:
                    continue
            return records
        except ImportError:
            return [{"error": "dnspython not installed"}]

    @staticmethod
    def get_ssl_info(target: str) -> Dict[str, Any]:
        """Fetch SSL certificate details and ensure JSON serializable output."""
        try:
            hostname = ReconService._clean_target(target)
            port = 443
            cert_pem = ssl.get_server_certificate((hostname, port), timeout=5)
            x509 = OpenSSL.crypto.load_certificate(OpenSSL.crypto.FILETYPE_PEM, cert_pem)
            
            def parse_components(components):
                return {k.decode('utf-8'): v.decode('utf-8') for k, v in components}

            notAfter = datetime.strptime(x509.get_notAfter().decode('ascii'), '%Y%m%d%H%M%SZ')
            
            return {
                "issuer": parse_components(x509.get_issuer().get_components()),
                "subject": parse_components(x509.get_subject().get_components()),
                "notAfter": notAfter.isoformat(),
                "expired": x509.has_expired()
            }
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def get_subdomains(target: str) -> List[str]:
        """Discovery common subdomains (Simulated discovery)."""
        domain = ReconService._clean_target(target)
        if not domain or domain.replace('.', '').isdigit():
            return []
            
        subs = ['www', 'mail', 'api', 'dev', 'staging', 'webmail', 'blog']
        discovered = []
        
        def check_sub(s):
            try:
                full = f"{s}.{domain}"
                socket.gethostbyname(full)
                return full
            except:
                return None

        with concurrent.futures.ThreadPoolExecutor(max_workers=len(subs)) as executor:
            results = executor.map(check_sub, subs)
            discovered = [r for r in results if r]
            
        return discovered

    @staticmethod
    def get_whois_info(target: str) -> Dict[str, Any]:
        """Fetch domain WHOIS information (Owner, Registrar, Dates)."""
        try:
            import whois
            domain = ReconService._clean_target(target)
            if domain.replace('.', '').isdigit(): # It's an IP
                return {"error": "WHOIS lookup requires a domain, not an IP."}
                
            w = whois.whois(domain)
            
            # Normalize dates as they can be lists or single objects
            def normalize_date(d):
                if isinstance(d, list):
                    return d[0].isoformat() if d[0] else None
                return d.isoformat() if d else None

            return {
                "registrar": w.registrar,
                "creation_date": normalize_date(w.creation_date),
                "expiration_date": normalize_date(w.expiration_date),
                "name": w.name if hasattr(w, 'name') else None,
                "org": w.org if hasattr(w, 'org') else None,
                "country": w.country if hasattr(w, 'country') else None
            }
        except ImportError:
            return {"error": "python-whois library not installed"}
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def fingerprint_headers(target: str) -> Dict[str, Any]:
        """Detect server technology and version via real HTTP headers."""
        url = target if target.startswith('http') else f'http://{target}'
        try:
            resp = requests.get(url, timeout=5, allow_redirects=True)
            headers = dict(resp.headers)
            tech_hints = {}
            interesting = ['Server', 'X-Powered-By', 'Via', 'X-AspNet-Version', 'X-Runtime']
            
            for key in interesting:
                if key in headers:
                    tech_hints[key] = headers[key]

            # Simplified version detection from Server header
            server = headers.get('Server', '')
            version = "Unknown"
            if '/' in server:
                version = server.split('/')[-1]

            return {
                "status_code": resp.status_code,
                "url": resp.url,
                "headers": tech_hints,
                "version": version
            }
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def run_full_recon(target: str) -> Dict[str, Any]:
        """Run a full reconnaissance with WHOIS and service discovery in parallel."""
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            future_ip = executor.submit(ReconService.get_ip_intelligence, target)
            future_dns = executor.submit(ReconService.enumerate_dns, target)
            future_headers = executor.submit(ReconService.fingerprint_headers, target)
            future_ssl = executor.submit(ReconService.get_ssl_info, target)
            future_subs = executor.submit(ReconService.get_subdomains, target)
            future_whois = executor.submit(ReconService.get_whois_info, target)

            ip_info = future_ip.result()
            dns_records = future_dns.result()
            headers_info = future_headers.result()
            ssl_info = future_ssl.result()
            subdomains = future_subs.result()
            whois_info = future_whois.result()
        
        return {
            "ip_intelligence": ip_info,
            "dns_records": dns_records,
            "headers": headers_info,
            "ssl_info": ssl_info,
            "subdomains": subdomains,
            "whois_info": whois_info
        }
