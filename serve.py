#!/usr/bin/env python3
"""本機預覽：python3 serve.py [port]"""
import http.server, socketserver, sys, os, functools

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"龍德分會活動公告網站 → http://localhost:{PORT}/  (Ctrl+C 停止)")
    httpd.serve_forever()
