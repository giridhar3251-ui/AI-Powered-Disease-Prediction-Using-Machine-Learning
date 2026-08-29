import os
import joblib
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

def main():
    train_path = os.path.join(DATA_DIR, "Training.csv")
    test_path = os.path.join(DATA_DIR, "Testing.csv")

    if not os.path.exists(train_path) or not os.path.exists(test_path):
        print("Data files not found. Running data generator...")
        import generate_data

    print(f"Loading data from {train_path} and {test_path}...")
    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)

    # Clean symptom column names (strip whitespace)
    df_train.columns = [c.strip() for c in df_train.columns]
    df_test.columns = [c.strip() for c in df_test.columns]

    target_col = "prognosis"
    symptom_cols = [c for c in df_train.columns if c != target_col]

    X_train = df_train[symptom_cols].values
    y_train = df_train[target_col].values

    X_test = df_test[symptom_cols].values
    y_test = df_test[target_col].values

    classes = np.unique(y_train)

    models = {
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Naive Bayes (Multinomial)": MultinomialNB(),
        "Support Vector Machine": SVC(probability=True, kernel="linear", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42)
    }

    results = {}
    print("\n" + "="*70)
    print(f"{'Model':<28} | {'Train Acc':<10} | {'Test Acc':<10} | {'F1-Score':<10}")
    print("="*70)

    best_score = -1.0
    best_model_name = "Random Forest"
    best_model_obj = None

    for name, clf in models.items():
        clf.fit(X_train, y_train)
        train_acc = accuracy_score(y_train, clf.predict(X_train))
        y_pred = clf.predict(X_test)
        test_acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        results[name] = {"train_acc": train_acc, "test_acc": test_acc, "f1": f1, "model": clf}
        print(f"{name:<28} | {train_acc*100:>8.2f}% | {test_acc*100:>8.2f}% | {f1:>10.4f}")

        # Favor Random Forest on tie
        if test_acc > best_score or (test_acc == best_score and name == "Random Forest"):
            best_score = test_acc
            best_model_name = name
            best_model_obj = clf

    print("="*70)
    print(f"\nWinning Model Selected: {best_model_name} (Test Accuracy: {best_score*100:.2f}%)")

    # Serialize artifacts
    model_artifact = {
        "model_name": best_model_name,
        "model": best_model_obj,
        "symptoms": symptom_cols,
        "classes": list(classes),
        "test_accuracy": best_score,
        "benchmark": {k: {"train_acc": v["train_acc"], "test_acc": v["test_acc"], "f1": v["f1"]} for k, v in results.items()}
    }

    save_path = os.path.join(MODEL_DIR, "model.joblib")
    joblib.dump(model_artifact, save_path)
    print(f"Serialized model and metadata to: {save_path}")

if __name__ == "__main__":
    main()
