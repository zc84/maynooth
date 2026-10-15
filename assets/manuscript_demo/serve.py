from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import os
os.chdir(Path(__file__).parent)
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0]=='/02_iiif_manuscript/manifest.json':
            base='http://'+self.headers.get('Host','localhost:8000')
            s=Path('02_iiif_manuscript/manifest.template.json').read_text().replace('__BASE__',base)
            b=s.encode()
            self.send_response(200);self.send_header('Content-Type','application/ld+json; charset=utf-8');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
        else: super().do_GET()
ThreadingHTTPServer(('0.0.0.0',8000),Handler).serve_forever()
