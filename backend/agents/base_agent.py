"""
Base Agent class for all worker agents
"""
from typing import Dict, Any, List
import requests
import json

class BaseAgent:
    def __init__(self, api_base_url: str = "http://localhost:5000"):
        self.api_base_url = api_base_url
        self.name = "BaseAgent"
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's task"""
        raise NotImplementedError("Subclasses must implement execute method")
    
    def log(self, message: str):
        """Log agent activity"""
        print(f"[{self.name}] {message}")
