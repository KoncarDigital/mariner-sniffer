Opis
====
Aplikacija služi prikazu prometa po Mariner protokolu. Korisniku se, ovisno o upisanim parametrima, prikazuje određeni promet proslijeđen s HAT platforme (proizvoda).

Upute za pokretanje
===================
Frontend i backend dio aplikacije pokreću se odvojeno.
Frontend se nalazi unutar direktorija `web_client` i pokreće se naredbom ``npm start``.
Backend se pokreće iz direktorija `server` izvođenjem naredbe ``python main.py``.

Upute za korištenje
===================
Pri pokretanju aplikacije korisniku se prikazuje forma.
Korisnik upisuje parametre povezivanja na HAT platformu (proizvod) kako bi uspostavila konekcija s bilo kojom dostupnom HAT platformom (produktom).
Parametri povezivanja uključuju IP i port postojeće HAT platforme (proizvoda), Last Event Id te Subscriptions.
Upis parametara Server IP i Server Port je obavezan. Korisniku se promet neće prikazivati dok ne ispuni te parametre.

Last Event Id sadrži dvije opcije: Current events i All-time events.
All-time events opcija označava slanje svog dostupnog prometa, a Current events slanje dijela prometa, odnosno, slat će se sav promet koji do trenutka podnošenja forme nije bio prethodno zatražen od strane korisnika.

Subscriptions opcija je način na koji se korisniku daje mogućnost filtriranja prometa.
Korisnik željene pretplate može izabrati na način da odabere pretplate iz padajućeg izbornika.
Korisniku se klikom na polje Select subscriptions otvara padajući izbornik te se određena pretplata izabire klikom na tu pretplatu.
Korisnik ima opciju izabrati više pretplata iz padajućeg izbornika, a ukloniti ih može pritiskom na `x`.

Pritiskom na gumb Submit korisnik se preusmjerava na stranicu s prikazom prometa.
Inicijalni izgled stranice je dostupan dok se prethodno zatraženi promet ne učita.

Nakon učitavanja, promet je na stranici prikazan u obliku tablice sa sljedećim kolonama: Id, Payload, Source Date, Source Time, Date, Time i Type.
U gornjem lijevom dijelu ekrana nalazi se alatna traka s opcijama Columns, Filters i Export.
Odabirom na Columns korisnik ima opciju maknuti iz prikaza željene kolone.
Gumb Filters daje opciju filtriranja prometa po vrijednostima unutar odabrane kolone. Filtriranje je ograničeno na jedan proizvoljan filter u nekom trenutku.
Filter se može poništiti u svrhu postavljanja novog ili povratka na prikaz potpunog snimljenog prometa.
Pritiskom na Export korisniku se otvara opcija Download as CSV. Nakon klika na tu opciju se snimljeni promet sprema u CSV datoteku koja se preuzima na korisnikov uređaj.

Klikom na gornji desni gumb Manage subscriptions korisnik se preusmjerava na formu za upis parametra povezivanja na HAT platformu (proizvod), a klikom na Upload CSV file
preusmjeravanje se vrši na stranicu za učitavanje preuzetog prometa.
Na stranici za učitavanje preuzetog prometa korisnik klikom na Choose File odabire .csv datoteku prethodno snimljenog prometa sa svojeg računala.

U slučaju nemogućnosti spajanja na željenu HAT platformu (proizvod) korisniku se javlja prikladna informacija.
