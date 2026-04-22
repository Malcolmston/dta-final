import pandas as pd
import main


class TestToSerializable:
    def test_dataframe(self, sample_df):
        result = main._to_serializable(sample_df)
        assert isinstance(result, list)
        assert result[0]["Open"] == 100.0

    def test_series(self):
        s = pd.Series({"a": 1, "b": 2})
        result = main._to_serializable(s)
        assert isinstance(result, dict)
        assert result["a"] == 1

    def test_dict_recursive(self, sample_df):
        d = {"df": sample_df, "val": 42}
        result = main._to_serializable(d)
        assert isinstance(result["df"], list)
        assert result["val"] == 42

    def test_list_recursive(self, sample_df):
        data = [sample_df, {"x": 1}]
        result = main._to_serializable(data)
        assert isinstance(result[0], list)
        assert result[1] == {"x": 1}

    def test_plain_passthrough(self):
        assert main._to_serializable(42) == 42
        assert main._to_serializable("hi") == "hi"
        assert main._to_serializable(3.14) == 3.14
        assert main._to_serializable(None) is None

    def test_tuple_treated_as_list(self):
        result = main._to_serializable((1, 2, 3))
        assert result == [1, 2, 3]

    def test_object_with_dict(self):
        class Obj:
            def __init__(self):
                self.x = 1
                self.y = "hi"
        result = main._to_serializable(Obj())
        assert result == {"x": 1, "y": "hi"}
