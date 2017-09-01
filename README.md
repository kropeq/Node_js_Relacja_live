## Strona internetowa z relacją live i czatem.
----
### Cel projektu

Poznanie sposobu pisania aplikacji webowych w języku JavaScript z wykorzystaniem technologii NodeJS.

----
### Opis działania

Strona internetowa w formie blogu z relacją live wyników skoków narciarskich. Dostęp do relacji uzyskuje się poprzez wcześniejszą rejestrację konta użytkownika i późniejsze zalogowanie na to konto. Wyniki w relacji live odświeżają się automatycznie bez konieczności odświeżania strony( wykorzystanie WebSockets ). Co więcej, kolejno dodawane wyniki pojawiają się w odpowiednim miejscu tabeli. Ponadto użytkownicy mają możliwość dodawania i śledzenia na bieżąco komentarzy użytkowników na udostępnionym czacie. Istnieje również możliwość zgłaszania nieprawidłowości do administratora w formie prywatnej wiadomości. W wersji dla administratora znajduje się ponadto zakładka z możliwością przygotowania listy startowej zawodników, która jest później wykorzystywana do wyświetlania podpowiedzi podczas wprowadzania wyników.

---
### Role w projekcie

* _administrator_ - dostęp do edycji, usuwania i modyfikowania newsów,  listy startowej zawodników oraz wyników relacji LIVE. Ponadto możliwość odpowiedzi użytkownikom na prywatne wiadomości. Konto admina: __login__: _master_, __hasło__:_of disaster_
* _użytkownik_ - możliwość utworzenia konta, a po zalogowaniu śledzenia relacji LIVE, czatowania oraz wysyłania prywatnych wiadomości do administratora.

---
### Funkcjonalność

* rejestracja
* logowanie
* newsy
* historia newsów
* lista startowa zawodników
* relacja live wyników
* autouzupełnianie w panelu administratora
* live czat do relacji
* prywatne wiadomości admin <-> user


---
### Wykorzystane Technologie:

1. Express
2. Socket.io
3. MongoDB
4. Body parser
5. Cookie parser
6. Session
7. EJS

---
### Sposób uruchomienia:

1. Instalacja [nodeJS](https://nodejs.org/en/).
2. Pobranie repozytorium.
3. Instalacja projektu: __npm install__
4. Uruchomienie serwera: __npm start__
5. Uruchomienie aplikacji w przeglądarce: __localhost:3000__

---
### Prezentacja aplikacji

##### Strona główna - newsy
Z poziomu administratora, po wejściu w artykuł znajdują się również opcje edycji artykułu. Istnieje również możliwość dodawania nowych.

![Newsy](https://bitbucket.org/kropeq/node_js_relacja_live/raw/master/screens/widok_newsow.png)

##### Relacja LIVE - widok użytkownika
Po zalogowaniu na konto użytkownika, wchodząc w zakładkę relacji live, użytkownik ma dostęp do śledzenia relacji live zawodów, uczestnictwa w czacie online, a także zgłaszania błędów do administratora.

![Relacja LIVE](https://bitbucket.org/kropeq/node_js_relacja_live/raw/master/screens/widok_uzytkownika.png)

##### Lista startowa - dostęp tylko dla administratora
Tylko z poziomu administratora dostępna jest zakładka _Zawodnicy_. Po przejściu do niej administrator ma możliwość tworzenia listy startowej zawodników będących brać udział w konkursie. Dodanie zawodnika podświetlane jest na żółto, zaś edycja na pomarańczowo. Każda zmiana powoduje wskakiwanie elementu w odpowiednie miejsce względem numeru startowego.

![Lista startowa](https://bitbucket.org/kropeq/node_js_relacja_live/raw/master/screens/update_zawodnika.png)

##### Relacja LIVE - widok administratora
Relacja live z poziomu administratora wyposażona jest w panel do zarządzania wynikami, a także w podgląd tabeli. Dodatkowo w dolnym panelu istnieje możliwość korespondencji z użytkownikami. Administrator podczas wprowadzania nowego wyniku uzyskuje listę podpowiedzi na podstawie zgłoszonej wcześniej listy startowej w zakładce _Zawodnicy_.

![Relacja LIVE](https://bitbucket.org/kropeq/node_js_relacja_live/raw/master/screens/widok_administratora.png)

##### Relacja LIVE - dodanie wyniku
Dodanie lub aktualizacja wyniku jest podświetlana i umieszczana we właściwym miejscu bez konieczności odświeżania okna przeglądarki. Dzieje się tak u wszystkich uczestników relacji równocześnie.

![Relacja LIVE](https://bitbucket.org/kropeq/node_js_relacja_live/raw/master/screens/dodanie_wyniku.png)

##### Relacja LIVE - odpowiedź administratora
Odpowiedź administratora jest wyróżniona kolorem czerwonym i jest widoczna jedynie u użytkownika, do którego kierowana była odpowiedź.

![Relacja LIVE](https://bitbucket.org/kropeq/node_js_relacja_live/raw/master/screens/odpowiedz_administratora.png)