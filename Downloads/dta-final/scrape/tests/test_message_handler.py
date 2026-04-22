import json
from unittest.mock import mock_open, patch
import main


class TestMessageHandler:
    def test_prints_message(self, capsys):
        with patch("builtins.open", mock_open()):
            main.message_handler({"type": "quote", "price": 150})
        assert "quote" in capsys.readouterr().out

    def test_writes_jsonl(self):
        m = mock_open()
        with patch("builtins.open", m):
            main.message_handler({"price": 99})
        written = m().write.call_args[0][0]
        assert json.loads(written.strip())["price"] == 99
