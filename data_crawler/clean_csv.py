import csv
import re
import os

def clean_value(val: str) -> str:
    return re.sub(r'[\r\n]+', ' ', val).strip()

def clean_csv(input_path: str, output_path: str):
    with open(input_path, encoding='utf-8', newline='') as fin:
        reader = csv.reader(fin)
        rows = []
        for row in reader:
            rows.append([clean_value(cell) for cell in row])

    with open(output_path, 'w', encoding='utf-8', newline='') as fout:
        writer = csv.writer(fout, quoting=csv.QUOTE_ALL)
        writer.writerows(rows)

    print(f"Done: {output_path}  ({len(rows)} rows)")

base = os.path.dirname(__file__)
clean_csv(
    os.path.join(base, 'all-task-7-overview.csv'),
    os.path.join(base, 'all-task-7-overview-clean.csv'),
)
clean_csv(
    os.path.join(base, 'all-task-7-featured-reviews.csv'),
    os.path.join(base, 'all-task-7-featured-reviews-clean.csv'),
)
