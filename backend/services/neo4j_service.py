import os
import logging

try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False

class Neo4jService:
    """
    Expert: Hybrid Persistence Controller for Relationship Intelligence.
    Handles graph node injection and complex relationship mapping (Cypher).
    """
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None
        
        if NEO4J_AVAILABLE:
            try:
                self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            except Exception as e:
                logging.error(f"Neo4j Connection Failed: {e}")

    def close(self):
        if self.driver:
            self.driver.close()

    def sync_finding_to_graph(self, host_ip: str, port: int, service_name: str, cve_id: str, cvss: float, edb_id: str = None):
        """
        Synchronizes a PostgreSQL finding into the Neo4j Graph.
        Expert Cypher Logic: MERGE nodes to prevent duplicates, CREATE relationships.
        """
        if not self.driver:
            logging.info(f"[GRAPH-FALLBACK] Simulated Cypher: MERGE (h:Host {{ip: '{host_ip}'}}) ...")
            return

        with self.driver.session() as session:
            session.execute_write(self._sync_tx, host_ip, port, service_name, cve_id, cvss, edb_id)

    @staticmethod
    def _sync_tx(tx, host_ip, port, service_name, cve_id, cvss, edb_id):
        # 1. Ensure Host exists
        tx.run("MERGE (h:Host {ip: $ip})", ip=host_ip)
        
        # 2. Ensure Service exists and link to Host
        tx.run("""
            MATCH (h:Host {ip: $ip})
            MERGE (s:Service {port: $port, name: $name})
            MERGE (h)-[:EXPOSES]->(s)
        """, ip=host_ip, port=port, name=service_name)
        
        # 3. Ensure Vulnerability exists and link to Service
        tx.run("""
            MATCH (s:Service {port: $port})
            MERGE (v:Vulnerability {cve_id: $cve_id})
            ON CREATE SET v.cvss = $cvss
            MERGE (s)-[:AFFECTED_BY]->(v)
        """, port=port, cve_id=cve_id, cvss=cvss)
        
        # 4. Ensure Exploit exists and link to Vulnerability
        if edb_id:
            tx.run("""
                MATCH (v:Vulnerability {cve_id: $cve_id})
                MERGE (e:Exploit {edb_id: $edb_id})
                MERGE (v)-[:WEAPONIZED_BY]->(e)
            """, cve_id=cve_id, edb_id=edb_id)

    def get_most_critical_path(self, host_ip: str):
        """
        Expert Graph Query: Find the path with the highest cumulative CVSS to an Exploit.
        """
        if not self.driver:
            return []

        query = """
        MATCH p=(h:Host {ip: $ip})-[:EXPOSES]->(s)-[:AFFECTED_BY]->(v)-[:WEAPONIZED_BY]->(e)
        RETURN p, v.cvss as score
        ORDER BY score DESC
        LIMIT 1
        """
        with self.driver.session() as session:
            result = session.run(query, ip=host_ip)
            record = result.single()
            return record if record else []

neo4j_service = Neo4jService()
