
TOTAL_MENSAGENS = 20
print("=== CONFIGURAÇÃO DO SIMULADOR ===")
print("Canais disponíveis: 1, 2, 3 e 4")

CANAL_INTERFERIDO = int(
    input("Qual canal terá interferência? ")
)

if CANAL_INTERFERIDO not in [1, 2, 3, 4]:
    print("Canal inválido! Escolha um canal de 1 a 4.")
    exit()


canal_fixo = 1
sucesso_fixo = 0


sequencia_canais = [1, 2, 3, 4]
sucesso_salto = 0

print("=== SIMULADOR DE HEDY LAMARR ===")
print("Canal com interferência:", CANAL_INTERFERIDO)
print("Total de mensagens:", TOTAL_MENSAGENS)

print("\n--- SISTEMA A: FREQUÊNCIA FIXA ---")

for mensagem in range(1, TOTAL_MENSAGENS + 1):
    if canal_fixo == CANAL_INTERFERIDO:
        print(f"Mensagem {mensagem}: FALHOU")
    else:
        sucesso_fixo += 1
        print(f"Mensagem {mensagem}: RECEBIDA")

print("\n--- SISTEMA B: SALTO DE FREQUÊNCIA ---")

for mensagem in range(1, TOTAL_MENSAGENS + 1):
    indice = (mensagem - 1) % len(sequencia_canais)
    canal_atual = sequencia_canais[indice]

    if canal_atual == CANAL_INTERFERIDO:
        print(
            f"Mensagem {mensagem}: canal {canal_atual} "
            "- FALHOU"
        )
    else:
        sucesso_salto += 1
        print(
            f"Mensagem {mensagem}: canal {canal_atual} "
            "- RECEBIDA"
        )

percentual_fixo = sucesso_fixo / TOTAL_MENSAGENS * 100
percentual_salto = sucesso_salto / TOTAL_MENSAGENS * 100

print("\n=== RESULTADO FINAL ===")
print(f"Frequência fixa: {sucesso_fixo}/{TOTAL_MENSAGENS}")
print(f"Taxa de sucesso: {percentual_fixo:.1f}%")

print(f"\nSalto de frequência: {sucesso_salto}/{TOTAL_MENSAGENS}")
print(f"Taxa de sucesso: {percentual_salto:.1f}%")
