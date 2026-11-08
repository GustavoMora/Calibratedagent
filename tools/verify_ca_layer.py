#!/usr/bin/env python3
"""verify_ca_layer.py · Comprueba que un index.html difiere de su build base SOLO por:
los parches anclados del cerebro (tools/apply_ca_layer.py) y la capa ca-final.
Uso: python3 tools/verify_ca_layer.py BASE.html index.html"""
import re, sys, importlib.util, pathlib
spec = importlib.util.spec_from_file_location("ap", pathlib.Path(__file__).with_name("apply_ca_layer.py"))
ap = importlib.util.module_from_spec(spec); spec.loader.exec_module(ap)
base = open(sys.argv[1], encoding="utf8").read(); new = open(sys.argv[2], encoding="utf8").read()
strip = lambda s: re.sub(r'<script id="ca-final-js">[\s\S]*?</script>', 'JS', re.sub(r'<style id="ca-final-css">[\s\S]*?</style>', 'CSS', s))
rev = new
for pid, old, newtxt in ap.PATCHES:
    o = old(base) if callable(old) else old
    assert rev.count(newtxt) == 1, f"parche {pid} no aparece exactamente una vez"
    rev = rev.replace(newtxt, o, 1)
ok = strip(rev) == strip(base)
print("[verify] fuera de la capa y de los parches anclados, el archivo es idéntico al base:", ok)
sys.exit(0 if ok else 1)
