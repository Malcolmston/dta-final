import argparse
import pytest


class TestCLI:
    def _parser(self):
        parser = argparse.ArgumentParser()
        parser.add_argument(
            "-f", "--format",
            choices=["plain", "json", "csv", "tsv", "yaml"],
            default="plain",
        )
        return parser

    def test_format_arg_choices(self):
        args = self._parser().parse_args(["-f", "json"])
        assert args.format == "json"

    def test_all_format_choices_accepted(self):
        for fmt in ("plain", "json", "csv", "tsv", "yaml"):
            args = self._parser().parse_args(["-f", fmt])
            assert args.format == fmt

    def test_format_invalid_choice_exits(self):
        with pytest.raises(SystemExit):
            self._parser().parse_args(["-f", "xml"])
