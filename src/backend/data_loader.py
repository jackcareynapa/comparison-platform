import pandas as pd

def load_developers():
    df = pd.read_csv("data/sample_developers_reformatted.csv")
    return df.to_dict(orient="records")