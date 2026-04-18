import networkx as nx
import os
from neo4j import GraphDatabase
from typing import List, Dict, Any

class AttackPathService:
    @staticmethod
    def _create_neo4j_graph(target: str, findings: List[Dict]):
        uri = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        
        try:
            driver = GraphDatabase.driver(uri, auth=(user, password))
            with driver.session() as session:
                session.run("MERGE (inet:Attacker {name: 'Internet'})")
                session.run("MERGE (target:Asset {name: $target})", target=target)
                session.run("MERGE (inet)-[:ATTACKS]->(target)")
                
                for f in findings:
                    port = f.get("port")
                    cve = f.get("cve_id", f.get("cve", "Unknown"))
                    session.run(
                        """
                        MATCH (target:Asset {name: $target})
                        MERGE (svc:Service {port: $port})
                        MERGE (target)-[:EXPOSES]->(svc)
                        MERGE (v:Vulnerability {id: $cve})
                        MERGE (svc)-[:HAS_VULN]->(v)
                        """,
                        target=target, port=port, cve=cve
                    )
            driver.close()
            return True
        except Exception as e:
            print(f"[AttackPath] Neo4j skipped or unavailable: {e}")
            return False

    @staticmethod
    def generate_attack_path(target: str, findings: List[Dict]) -> Dict[str, Any]:
        """Uses NetworkX and Neo4j graph logic to identify the critical attack path."""
        # Optional: Sync to Neo4j if available
        AttackPathService._create_neo4j_graph(target, findings)
        
        G = nx.DiGraph()
        G.add_node("Internet", type="attacker")
        G.add_node(target, type="asset")
        G.add_edge("Internet", target, weight=1.0, relation="routes_to")

        nodes = [{"id": "Internet", "label": "Attacker/Internet", "type": "attacker"},
                 {"id": target, "label": f"Target: {target}", "type": "asset"}]
        edges = [{"source": "Internet", "target": target, "relation": "routes_to"}]

        for f in findings:
            port = f.get("port", "unknown")
            svc_node = f"{target}:{port}"
            cve = f.get("cve_id", f.get("cve", "Unknown_Vuln"))
            cvss = float(f.get("cvss") or f.get("cvss_score") or 5.0)

            # Node creation
            if svc_node not in [n['id'] for n in nodes]:
                nodes.append({"id": svc_node, "label": f"Port {port}", "type": "service"})
                G.add_node(svc_node, type="service")
                G.add_edge(target, svc_node, weight=1.0)
                edges.append({"source": target, "target": svc_node, "relation": "exposes"})

            vuln_node = f"{svc_node}-{cve}"
            if vuln_node not in [n['id'] for n in nodes]:
                nodes.append({"id": vuln_node, "label": cve, "type": "vulnerability", "cvss": cvss})
                G.add_node(vuln_node, type="vulnerability")
                
                # Weight calculation (higher CVSS = lower weight/easier path)
                edge_weight = max(0.1, 10.0 - cvss)
                if str(f.get("exploit_available", "No")).lower() == "yes":
                    edge_weight *= 0.5 # Halve the difficulty if exploit exists
                
                G.add_edge(svc_node, vuln_node, weight=edge_weight)
                edges.append({"source": svc_node, "target": vuln_node, "relation": "has_vuln", "weight": edge_weight})
                
                # Add ultimate compromise node
                G.add_node("Compromise", type="goal")
                G.add_edge(vuln_node, "Compromise", weight=0.1)

        critical_path = []
        try:
            if "Compromise" in G.nodes:
                path = nx.shortest_path(G, source="Internet", target="Compromise", weight="weight")
                critical_path = path
        except nx.NetworkXNoPath:
            pass

        return {
            "critical_path": critical_path,
            "step_by_step": AttackPathService.generate_step_by_step_scenario(critical_path, G),
            "graph_data": {
                "nodes": nodes,
                "edges": edges
            }
        }

    @staticmethod
    def generate_step_by_step_scenario(path: List[str], G: nx.DiGraph) -> List[Dict]:
        """Translates a graph path into a high-fidelity analytical scenario."""
        if not path:
            return [{"step": 1, "description": "No viable critical attack path identified from external sources."}]
        
        scenario = []
        for i, node in enumerate(path):
            node_type = G.nodes[node].get('type', 'unknown')
            
            if node == "Internet":
                description = "Attacker initiates reconnaissance from the public internet, identifying routable infrastructure."
            elif node_type == "asset":
                description = f"Analytical mapping identifies {node} as the primary target asset entry point."
            elif node_type == "service":
                description = f"Service discovery confirms an active listener on {node.split(':')[-1]} providing a potential attack surface."
            elif node_type == "vulnerability":
                cve = node.split('-')[-1]
                description = f"Deep-dive analysis confirms the service is highly susceptible to {cve} due to missing patches or misconfiguration."
            elif node == "Compromise":
                description = "Attack chain successfully culminates in unauthorized asset orchestration or data exfiltration."
            else:
                description = f"Transition to {node} identified as a critical link in the kill-chain."
            
            scenario.append({
                "step": i + 1,
                "node": node,
                "type": node_type,
                "description": description
            })
        return scenario

