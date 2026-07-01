from pathlib import Path

base = Path(r'e:\XAMPP\htdocs\stoktu\TestImports')
files = sorted(base.glob('*.txt'))

for path in files:
    with path.open('r', encoding='utf-8-sig', newline='') as f:
        lines = f.readlines()

    if not lines:
        continue

    first = lines[0].rstrip('\n')
    header = first.split(',')
    if 'cantidad' not in header:
        continue

    idx = header.index('cantidad')
    updated = [first + '\n']
    changed = 0

    for line in lines[1:]:
        line = line.rstrip('\n')
        if not line.strip():
            updated.append('\n')
            continue

        parts = line.split(',')
        if len(parts) <= idx:
            updated.append(line + '\n')
            continue

        try:
            current = float(parts[idx].strip())
        except Exception:
            current = 0

        if current <= 0:
            new_val = 5
        elif current <= 5:
            new_val = 3
        elif current <= 15:
            new_val = max(3, int(round(current * 0.5)))
        elif current <= 30:
            new_val = max(5, int(round(current * 0.35)))
        else:
            new_val = max(7, int(round(current * 0.28)))

        parts[idx] = str(new_val)
        updated.append(','.join(parts) + '\n')
        if new_val != int(current):
            changed += 1

    with path.open('w', encoding='utf-8', newline='') as f:
        f.writelines(updated)

    print(f'{path.name}: {changed} filas ajustadas')
