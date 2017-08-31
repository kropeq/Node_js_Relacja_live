## Strona internetowa z relacją live i czatem.
----
### Cel projektu

Poznanie sposobu pisania aplikacji webowych w języku JavaScript z wykorzystaniem technologii NodeJS.

----
### Opis działania

Stworzenie strony internetowej z relacją live wyników skoków narciarskich. Wyniki w relacji live odświeżają się automatycznie bez konieczności odświeżania strony. Co więcej, kolejno dodawane wyniki pojawiają się w odpowiednim miejscu tabeli również bez konieczności odświeżania( wykorzystanie WebSockets ). Ponadto użytkownicy mają możliwość dodawania i śledzenia na bieżąco komentarzy użytkowników.

### Role w projekcie

* _administrator_ - dostęp do edycji, usuwania i modyfikowania newsów i wyników relacji LIVE, a także możliwość zmiany uprawnień innym użytkownikom.
* _użytkownik_ - możliwość tworzenia kont, dodawania komentarzy, śledzenia relacji LIVE po zalogowaniu oraz czatowania

### Funkcjonalność

* rejestracja
* logowanie
* newsy
* komentarze
* relacja live
* live czat do relacji

### Wykorzystane Technologie:
----

1. Express
2. Socket.io
3. MongoDB
4. Body parser
5. Cookie parser
6. Session
7. EJS

### Sposób uruchomienia:
----

1. Pobranie repozytorium.
2. Instalacja projektu: __npm install__
3. Uruchomienie serwera: __npm start__
4. Uruchomienie aplikacji w przeglądarce: __localhost:3000__