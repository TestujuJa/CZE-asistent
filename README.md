# Hlasový Asistent pro Android

Tento projekt je open-source hlasový asistent pro Android vytvořený v NativeScriptu. Umožňuje uživatelům definovat vlastní hlasové příkazy a mapovat je na konkrétní akce, jako je volání webhooků nebo spouštění úloh v aplikaci Tasker.

## Klíčové funkce

- **Vlastní aktivační fráze:** Nastavte si vlastní "wake word" pro aktivaci asistenta.
- **Správa akcí:** Vytvářejte a spravujte neomezený počet vlastních hlasových příkazů.
- **Podpora Webhooků:** Spouštějte automatizaci v chytré domácnosti (Home Assistant, IFTTT, atd.) voláním libovolné URL adresy.
- **Integrace s Taskerem:** Ovládejte jakoukoliv funkci telefonu spouštěním úloh v populární automatizační aplikaci **Tasker**.
- **Zvuková zpětná vazba:** Volitelné zvukové signály pro lepší interakci.
- **Jednoduché rozhraní:** Přehledné a snadno ovladatelné rozhraní pro nastavení.

---

## Uživatelská příručka

### První spuštění

Při prvním spuštění vás aplikace požádá o **povolení k přístupu k mikrofonu**. Toto povolení je nezbytné pro rozpoznávání hlasu. Prosím, povolte ho.

Po udělení oprávnění přejde aplikace do pohotovostního režimu. Na hlavní obrazovce uvidíte stav "Čekám na aktivační frázi...".

### Základní použití

1.  **Aktivace asistenta:** Řekněte jednu z aktivačních frází. Výchozí fráze jsou "**Hey asistente**" nebo "**Pomoc**".
2.  **Vyslovení příkazu:** Po aktivační frázi se stav změní na "Poslouchám...". Nyní vyslovte svůj příkaz (např. "rozsviť světlo v obýváku").
3.  **Zpracování:** Asistent rozpozná váš příkaz, provede nastavenou akci a zobrazí výsledek. Poté se opět vrátí do pohotovostního režimu.

### Nastavení aplikace

Na hlavní obrazovce klepněte na tlačítko **"Nastavení"** pro konfiguraci aplikace.

#### 1. Správa akcí

Zde definujete, co má asistent dělat.

-   **Přidání nové akce:**
    1.  **Název:** Pojmenujte si akci (např. "Světla v kuchyni").
    2.  **Spouštěcí fráze:** Napište frázi, kterou chcete akci spustit (např. "rozsviť v kuchyni"). Asistent hledá tuto frázi ve vašem příkazu, takže nemusí být přesná.
    3.  **Typ akce:** Vyberte si jednu ze dvou možností:
        -   **Webhook:** Pro volání webové adresy (URL).
            -   Do pole **"URL adresa webhooku"** vložte celou adresu, která se má zavolat.
        -   **Tasker:** Pro spuštění úlohy ve specifické aplikaci **Tasker**.
            -   Do pole **"Název úlohy v Taskeru"** napište **přesný název** úlohy, jak ji máte pojmenovanou v aplikaci Tasker.
    4.  Klepněte na **"Přidat akci"**.

-   **Seznam akcí:**
    -   Pod formulářem vidíte seznam všech vašich nastavených akcí.
    -   Pro smazání akce klepněte na tlačítko **"Odstranit"** vedle ní.

#### 2. Další nastavení

-   **Aktivační fráze:** Spravujte seznam frází, na které bude asistent reagovat.
-   **Zvuková zpětná vazba:** Zapněte nebo vypněte zvuky, které signalizují začátek a konec nahrávání.

---

## Požadavky

### Integrace s Taskerem

-   Abyste mohli používat akce typu "Tasker", musíte mít na svém telefonu nainstalovanou aplikaci **[Tasker](https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm)** od vývojáře joaomgcd.
-   V Taskeru musíte povolit externí kontrolu. V menu Taskeru jděte do `Preferences -> Misc -> Allow External Access` a ujistěte se, že je tato volba zaškrtnutá.

---

[Edit in StackBlitz ⚡️][def]

[def]: https://stackblitz.com/~/github.com/TestujuJa/CZE-asistent