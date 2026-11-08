"""
Tests de la revisión matemática M1/M2 · Calibrated Agent · © 2026 Gustavo Mora
Solo biblioteca estándar:  python3 -m unittest tests/test_math_review.py -v

Modelo reconstruido desde la web (umbrales de S5/S9 y la fórmula de pₐ del Detalle técnico):
  EU_act(p)  = p·b − (1−p)·c
  EU_ask(p)  = −k + r·b + (1−r)·EU_act(p)      (si la pregunta no aclara, se actúa con la interpretación inicial)
  EU_abs     = 0
Este archivo NO modifica parámetros congelados: los usa para reproducir lo publicado.
"""
import unittest, itertools

FROZEN = {"bajo": dict(b=1, c=1, k=.2, r=.925), "medio": dict(b=1, c=2, k=.2, r=.896), "alto": dict(b=1, c=4, k=.2, r=.646)}
SITE = {"bajo": dict(ps=.892, pa=-4.333), "medio": dict(ps=.926, pa=-1.564), "alto": dict(ps=.938, pa=.548)}

# ---------- modelo idealizado (el de la web) ----------
def eu_act(p, b, c, **_): return p*b - (1-p)*c
def eu_ask(p, b, c, k, r): return -k + r*b + (1-r)*eu_act(p, b, c)
def p_star(b, c, k, r): return 1 - k/(r*(b+c))                     # actuar ⇔ p ≥ p*
def p_abs(b, c, k, r): return 1 - (b-k)/((b+c)*(1-r))               # preguntar ⇔ p ≥ pₐ (frente a abstenerse)
def p_zero(b, c, **_): return c/(b+c)                                # actuar ⇔ p ≥ p₀ (frente a abstenerse)

# ---------- M1: comprensión ≠ ejecución ----------
def q_succ(p, e1, e0): return p*e1 + (1-p)*e0                        # P(Y=1 | x, actuar)
def eu_act_g(p, b, c, e1, e0, **_): return (b+c)*q_succ(p, e1, e0) - c
def eu_ask_g(p, b, c, k, r, e1, e0):                                 # aclarar ⇒ comprensión correcta ⇒ éxito con prob. e1
    return -k + r*((b+c)*e1 - c) + (1-r)*eu_act_g(p, b, c, e1, e0)
def p_star_g(b, c, k, r, e1, e0): return 1 - k/(r*(b+c)*(e1-e0))
def p_abs_g(b, c, k, r, e1, e0):
    q = (c + (k - r*((b+c)*e1 - c))/(1-r))/(b+c)
    return (q - e0)/(e1 - e0)

# ---------- M2: valor de la información ----------
def gain_vs_act(p, b, c, r, **_): return r*(1-p)*(b+c)               # lo que suma preguntar (sin k) frente a ACTUAR
def evsi_policy(p, b, c, r, **_):                                    # frente a la mejor acción sin información {actuar, abstenerse},
    best0 = max(eu_act(p, b, c), 0.0)                                # re-optimizando si la pregunta no aclara
    return r*b + (1-r)*best0 - best0
def evpi_policy(p, b, c, **_): return b - max(eu_act(p, b, c), 0.0)  # r = 1

GRID = [i/200 for i in range(201)]

class Reproduccion(unittest.TestCase):
    def test_umbrales_publicados(self):
        for cl, P in FROZEN.items():
            self.assertAlmostEqual(round(p_star(**P), 3), SITE[cl]["ps"], places=3, msg=cl)
            self.assertAlmostEqual(round(p_abs(**P), 3), SITE[cl]["pa"], places=3, msg=cl)
    def test_umbrales_son_cruces_de_utilidad(self):
        for P in FROZEN.values():
            ps, pa = p_star(**P), p_abs(**P)
            self.assertAlmostEqual(eu_act(ps, **P), eu_ask(ps, **P), places=12)
            if 0 <= pa <= 1: self.assertAlmostEqual(eu_ask(pa, **P), 0.0, places=12)
    def test_politica_por_fuerza_bruta(self):
        for P in FROZEN.values():
            ps, pa = p_star(**P), p_abs(**P)
            for p in GRID:
                u = {"act": eu_act(p, **P), "ask": eu_ask(p, **P), "abs": 0.0}
                best = max(u, key=u.get)
                expect = "act" if p > ps else ("ask" if p > pa else "abs")
                if min(abs(p-ps), abs(p-pa)) > 1e-9: self.assertEqual(best, expect, (P, p))

class M1_ComprensionNoEsEjecucion(unittest.TestCase):
    def test_reduce_al_modelo_idealizado(self):
        for P in FROZEN.values():
            self.assertAlmostEqual(p_star_g(**P, e1=1, e0=0), p_star(**P), places=12)
            self.assertAlmostEqual(p_abs_g(**P, e1=1, e0=0), p_abs(**P), places=12)
            for p in GRID:
                self.assertAlmostEqual(eu_act_g(p, **P, e1=1, e0=0), eu_act(p, **P), places=12)
                self.assertAlmostEqual(eu_ask_g(p, **P, e1=1, e0=0), eu_ask(p, **P), places=12)
    def test_formulas_generales_son_cruces(self):
        for P, (e1, e0) in itertools.product(FROZEN.values(), [(.95, .05), (.9, 0), (.8, .1)]):
            ps = p_star_g(**P, e1=e1, e0=e0)
            self.assertAlmostEqual(eu_act_g(ps, **P, e1=e1, e0=e0), eu_ask_g(ps, **P, e1=e1, e0=e0), places=10)
            pa = p_abs_g(**P, e1=e1, e0=e0)
            self.assertAlmostEqual(eu_ask_g(pa, **P, e1=e1, e0=e0), 0.0, places=10)
    def test_ejecucion_imperfecta_baja_p_estrella(self):
        for P in FROZEN.values():
            self.assertLess(p_star_g(**P, e1=.95, e0=.05), p_star(**P))
    def test_sin_ventaja_de_aclarar_nunca_conviene_preguntar(self):
        # si e1 − e0 ≤ k / (r(b+c)), preguntar nunca supera a actuar
        P = FROZEN["medio"]; d = P["k"]/(P["r"]*(P["b"]+P["c"]))
        for p in GRID:
            self.assertGreaterEqual(eu_act_g(p, **P, e1=.5+d/2, e0=.5-d/2) + 1e-12, eu_ask_g(p, **P, e1=.5+d/2, e0=.5-d/2))

class M2_ValorDeLaInformacion(unittest.TestCase):
    def test_coinciden_si_actuar_es_la_mejor_alternativa(self):
        for P in FROZEN.values():
            for p in GRID:
                if p >= p_zero(**P):
                    self.assertAlmostEqual(gain_vs_act(p, **P), evsi_policy(p, **P), places=12)
    def test_contraejemplo_debajo_de_p0(self):
        P = FROZEN["alto"]; p = .40                                    # p₀ = 0,8
        self.assertAlmostEqual(gain_vs_act(p, **P), 1.938, places=3)  # 0,646·0,6·5
        self.assertAlmostEqual(evsi_policy(p, **P), .646, places=3)   # 0,646·1
        self.assertGreater(gain_vs_act(p, **P), evsi_policy(p, **P))
    def test_nunca_menor(self):
        for P in FROZEN.values():
            for p in GRID: self.assertGreaterEqual(gain_vs_act(p, **P) + 1e-12, evsi_policy(p, **P))
    def test_evpi_es_r_igual_1(self):
        for P in FROZEN.values():
            Q = dict(P, r=1.0)
            for p in GRID: self.assertAlmostEqual(evpi_policy(p, **P), evsi_policy(p, **Q), places=12)

class ObservacionPendiente_ReoptimizarTrasPreguntar(unittest.TestCase):
    """La zona de abstención depende de suponer que, si la pregunta no aclara, se actúa igual.
    Si tras una pregunta fallida se re-optimiza (actuar o abstenerse), con estos parámetros
    preguntar domina a abstenerse para toda p porque r·b > k. NO se cambia nada: queda para Gauss."""
    def test_con_reoptimizacion_no_hay_zona_de_abstencion(self):
        for P in FROZEN.values():
            for p in GRID:
                eu = -P["k"] + P["r"]*P["b"] + (1-P["r"])*max(eu_act(p, **P), 0.0)
                self.assertGreater(eu, 0.0)
    def test_en_el_modelo_publicado_si_la_hay_en_alto(self):
        P = FROZEN["alto"]; self.assertLess(eu_ask(.40, **P), 0.0)

if __name__ == "__main__":
    unittest.main(verbosity=2)
