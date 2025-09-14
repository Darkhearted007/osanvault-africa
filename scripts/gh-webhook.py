#!/usr/bin/env python3
import http.server, hmac, hashlib, subprocess, os
SECRET=os.environ.get("GITHUB_WEBHOOK_SECRET","")
REPO_DIR=os.path.expanduser("~/www/osanvault-africa")
class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length=int(self.headers.get('content-length',0))
        body=self.rfile.read(length)
        sig=self.headers.get('x-hub-signature-256','').split('sha256=')[-1]
        if SECRET:
            mac=hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(mac,sig):
                self.send_response(403); self.end_headers(); return
        subprocess.run(["git","-C",REPO_DIR,"pull","origin","main"],check=False)
        self.send_response(200); self.end_headers()
    def log_message(self, fmt, *args): return
from http.server import HTTPServer
server=HTTPServer(("127.0.0.1",9000),Handler)
server.serve_forever()
