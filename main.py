import requests
import socket
import unittest

class UnitTest(unittest.TestCase):

    # Checks to be sure that we are running the server on port 5000
    def test_port(self):
        r = requests.get('http://centipedecheckers.ngrok.io/api/get_server')
        port = r.json()['server']['_connectionKey'][5:]
        self.assertEqual(port, '5000')

    # Checks that there are no socket connections upon starting the servers
    def test_socket_emptiness(self):
        r = requests.get('http://centipedecheckers.ngrok.io/api/test_socket_emptiness')
        self.assertEqual(r.json()['players'], 0)
        self.assertEqual(r.json()['spectators'], 0)

    # Checks to be sure that we are getting a valid IP from ngrok, implying that it is still live
    def test_ngrok_alive(self):
        ip = socket.gethostbyname('centipedecheckers.ngrok.io')
        self.assertIsNotNone(ip)


if __name__ == '__main__':
    unittest.main()