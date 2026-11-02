"""24001010908 何良辰：图像解决方案独立启动入口，Python 标准库。"""
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
import argparse
import sys
import webbrowser

hlc_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(hlc_root))
from server import ProjectHandler

if __name__ == '__main__':
    hlc_parser = argparse.ArgumentParser()
    hlc_parser.add_argument('--port', type=int, default=8082)
    hlc_args = hlc_parser.parse_args()
    try:
        hlc_server = ThreadingHTTPServer(('127.0.0.1', hlc_args.port), partial(ProjectHandler, directory=str(hlc_root)))
    except OSError as hlc_error:
        print(f'服务启动失败：{hlc_error}\n可用 start-image-lab.bat --port 8083 更换端口。')
        sys.exit(1)
    hlc_url = f'http://localhost:{hlc_args.port}/image-solution/index.html'
    print(f'Meituan image solution: {hlc_url}', flush=True)
    print('Press Ctrl+C to stop.', flush=True)
    webbrowser.open(hlc_url)
    try:
        hlc_server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        hlc_server.server_close()
