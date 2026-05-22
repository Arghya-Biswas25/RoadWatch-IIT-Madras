# 🗂️ RoadWatch — Data Source Compendium

> **235+ verified data sources** across Indian Government Portals, International/Technical APIs, and News/Media platforms for the RoadWatch road infrastructure monitoring PWA.

> [!NOTE]
> This document was compiled as part of the RoadWatch project for IIT Madras COERS Hackathon 2026. Sources are organized by domain and category with relevance ratings for MVP prioritization.

---

## Table of Contents

1. [Part A: Indian Government Data Sources (88 sources)](#part-a-indian-government-data-sources)
2. [Part B: International & Technical APIs (78 sources)](#part-b-international--technical-apis)
3. [Part C: News & Media Sources (69 sources)](#part-c-news--media-sources)
4. [MVP Priority Matrix](#mvp-priority-matrix)

---

# Part A: Indian Government Data Sources

## A1. Central Government Portals

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 1 | **data.gov.in** | https://data.gov.in/ | 500K+ datasets: road statistics, PMGSY progress, budget allocations | Yes – REST API (JSON/XML) | Open | ⭐ High |
| 2 | **NHAI** | https://nhai.gov.in/ | NH project details, toll data, corridor maps, monitoring dashboard | No (PDFs, portal) | Open | ⭐ High |
| 3 | **MoRTH** | https://morth.nic.in/ | Road statistics, accident data, highway length, budget allocations | No (downloadable reports) | Open | ⭐ High |
| 4 | **PMGSY OMMS** | https://omms.nic.in/ | Rural road construction: road-wise progress, contractor details, expenditure | Partial (via data.gov.in) | Open | ⭐ High |
| 5 | **PMGSY GIS** | https://gis.pmgsy.nic.in/ | GIS mapping of PMGSY roads, village connectivity status | WMS/WMTS | Open | ⭐ High |
| 6 | **Indian Roads Congress (IRC)** | https://www.irc.nic.in/ | Road design standards, specifications, technical guidelines | No (paid publications) | Restricted | Medium |
| 7 | **Border Roads Organisation (BRO)** | https://bro.gov.in/ | Strategic road data, border area project progress | No | Open | Low |
| 8 | **NHAI Project Monitoring** | https://nhaipms.nic.in/ | Phase-wise project status, contractor assignments, financial progress | No | Open | ⭐ High |
| 9 | **Bharatmala Pariyojana** | https://bharatmala.nhai.gov.in/ | Bharatmala project progress, economic corridor data | No | Open | High |
| 10 | **API Setu (MeitY)** | https://apisetu.gov.in/ | Government API gateway — directory of available government APIs | Yes – Multiple APIs | Open/Restricted | ⭐ High |

---

## A2. State PWD Portals

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 11 | **West Bengal PWD** | https://wbpwd.gov.in/ | State road data, project tenders, contractor assignments | No | Open | ⭐ High |
| 12 | **Tamil Nadu Highways** | https://tnhighways.gov.in/ | State/national highway data, project status, e-tendering | No | Open | ⭐ High |
| 13 | **Maharashtra PWD** | https://mahapwd.gov.in/ | Road project data, road-wise expenditure, contractor details | No | Open | ⭐ High |
| 14 | **Karnataka PWD** | https://kpwd.karnataka.gov.in/ | State road network, project monitoring, contractor database | No | Open | ⭐ High |
| 15 | **Uttar Pradesh PWD** | https://uppwd.gov.in/ | Road construction data, tenders, project monitoring | No | Open | High |
| 16 | **Madhya Pradesh PWD** | https://mpwrd.gov.in/ | Road construction project data, expenditure tracking | No | Open | High |
| 17 | **Rajasthan PWD** | https://pwd.rajasthan.gov.in/ | Road construction data, contractor info, tenders | No | Open | High |
| 18 | **Gujarat Roads & Buildings** | https://rnbgujarat.gov.in/ | Road project data, e-tendering | No | Open | High |
| 19 | **Bihar Road Construction Dept** | https://rcd.bihar.gov.in/ | Road construction projects, contractor info, PMGSY data | No | Open | High |
| 20 | **Andhra Pradesh R&B** | https://aprdc.ap.gov.in/ | Road project data, budget allocations | No | Open | High |
| 21 | **Kerala PWD** | https://keralapwd.gov.in/ | Road data, project monitoring, e-tendering | No | Open | High |
| 22 | **Odisha Works Dept** | https://odishapwd.gov.in/ | Road construction data, project details | No | Open | Medium |
| 23 | **Telangana R&B** | https://randb.telangana.gov.in/ | State road data, project monitoring | No | Open | Medium |
| 24 | **Jharkhand Road Const. Dept** | https://jrcd.jharkhand.gov.in/ | Road project data | No | Open | Medium |

---

## A3. Municipal Corporation Data Portals

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 25 | **BBMP Bengaluru** | https://bbmp.gov.in/ | Ward-wise road data, pothole reports, civic complaints | No | Open | ⭐ High |
| 26 | **BMC Mumbai** | https://portal.mcgm.gov.in/ | Road repair data, ward-wise infrastructure, complaints | No | Open | ⭐ High |
| 27 | **KMC Kolkata** | https://www.kmcgov.in/ | Road maintenance, civic complaints, ward data | No | Open | ⭐ High |
| 28 | **GCC Chennai** | https://chennaicorporation.gov.in/ | Road data, civic complaints, ward infrastructure | No | Open | ⭐ High |
| 29 | **NDMC New Delhi** | https://www.ndmc.gov.in/ | Road maintenance, street lighting, civic data | No | Open | High |
| 30 | **MCD Delhi** | https://mcdonline.nic.in/ | Ward-wise road data, civic infrastructure | No | Open | High |
| 31 | **PMC Pune** | https://pmc.gov.in/ | Road data, civic complaints | No | Open | Medium |
| 32 | **AMC Ahmedabad** | https://ahmedabadcity.gov.in/ | City infrastructure data | No | Open | Medium |
| 33 | **GHMC Hyderabad** | https://www.ghmc.gov.in/ | Road maintenance, pothole data, complaint tracking | No | Open | High |
| 34 | **JMC Jaipur** | https://jaipurmc.org/ | Road infrastructure data | No | Open | Medium |

---

## A4. Budget & Expenditure Portals

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 35 | **PFMS** | https://pfms.nic.in/ | Real-time govt expenditure tracking, scheme-wise fund flow | Partial | Open | ⭐ High |
| 36 | **CAG** | https://cag.gov.in/ | Audit reports on road construction, PWD expenditure audits | No (PDF reports) | Open | ⭐ High |
| 37 | **Union Budget Portal** | https://www.indiabudget.gov.in/ | Ministry-wise budget allocations, infrastructure spending | No (PDFs/Excel) | Open | ⭐ High |
| 38 | **Open Budgets India** | https://openbudgetsindia.org/ | State/union budget data in machine-readable format | Yes – REST API | Open | ⭐ High |
| 39 | **State Budget Portals** | Various state finance dept URLs | State-level road/PWD budget allocations | No (PDFs) | Open | High |
| 40 | **CRIF Data** | Via MoRTH/budget documents | Central Road & Infrastructure Fund allocations | No | Open | High |
| 41 | **PMGSY Financial Data** | https://omms.nic.in/ | Road-wise financial progress, contractor payments | Via OMMS | Open | ⭐ High |

---

## A5. Public Grievance Portals

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 42 | **PG Portal (CPGRAMS)** | https://pgportal.gov.in/ | Public grievances against government departments | No | Open (registration) | ⭐ High |
| 43 | **MyGov** | https://www.mygov.in/ | Citizen engagement, issue reporting | No | Open | Medium |
| 44 | **NHAI Complaint Portal** | https://nhai.gov.in/complaint.htm | Highway-specific complaints, toll issues | No | Open | ⭐ High |
| 45 | **CM Helpline (various states)** | State-specific URLs | State-level civic complaint tracking | No | Open | High |
| 46 | **IGRS** | Various state implementations | State grievance tracking for PWD/road issues | No | Open | High |

---

## A6. Infrastructure Monitoring Portals

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 47 | **PRAGATI** | https://pragati.gov.in/ | PM's monitoring of infrastructure projects | No | Restricted | Medium |
| 48 | **eProcure** | https://eprocure.gov.in/ | Government tenders for road construction, contractor bids | No (searchable) | Open | ⭐ High |
| 49 | **GePNIC** | https://eprocure.gov.in/eprocure/app | State-level procurement, road construction tenders | No | Open | High |
| 50 | **Niti Aayog Infrastructure Dashboard** | https://www.niti.gov.in/ | State infrastructure rankings, development monitoring | No (reports) | Open | Medium |
| 51 | **PM Gati Shakti Portal** | https://pmgatishakti.gov.in/ | Multi-modal infrastructure planning, GIS-based | Restricted | Restricted | High |

---

## A7. GIS & Mapping Government Sources

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 52 | **ISRO Bhuvan** | https://bhuvan.nrsc.gov.in/ | Satellite imagery, thematic maps, road overlays | Yes – WMS/WMTS/WFS | Open | ⭐ High |
| 53 | **Survey of India** | https://surveyofindia.gov.in/ | Topographic maps, geodetic data | Limited | Partially restricted | Medium |
| 54 | **NSDI** | https://nsdiindia.gov.in/ | Metadata catalog for Indian geospatial data | Yes – CSW catalog | Open | Medium |
| 55 | **Smart Cities GIS** | https://smartcities.gov.in/ | Smart city GIS data, urban infrastructure | No (portal) | Open | Medium |
| 56 | **India GeoPortal** | https://indiageoportal.gov.in/ | Integrated geospatial data from multiple agencies | Limited | Open | High |
| 57 | **PMGSY GIS Portal** | https://gis.pmgsy.nic.in/ | GIS mapping of rural roads | WMS/WMTS | Open | ⭐ High |
| 58 | **NRSC** | https://www.nrsc.gov.in/ | Satellite data products, thematic maps | Via Bhuvan | Open | Medium |

---

## A8. Road Accident & Safety Data

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 59 | **NCRB** | https://ncrb.gov.in/ | Road accident statistics (ADSI reports) | No (PDFs/tables) | Open | ⭐ High |
| 60 | **MoRTH Accident Reports** | https://morth.nic.in/ | Annual road accident reports, state-wise data | No (PDF) | Open | ⭐ High |
| 61 | **iRAP India** | https://www.irap.org/ | Road safety star ratings, Safer Roads Investment Plans | Limited (ViDA) | Freemium | High |
| 62 | **AITD** | https://aitd.net/ | Transport research, road safety studies | No | Open | Medium |
| 63 | **SaveLIFE Foundation** | https://savelifefoundation.org/ | Road crash data, zero fatality corridor data | No (reports) | Open | Medium |

---

## A9. RTI Portals

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 64 | **RTI Online** | https://rtionline.gov.in/ | RTI requests to central ministries (MoRTH, NHAI) | No | Open (₹10 fee) | High |
| 65 | **State RTI Portals** | Various state URLs | State-level RTI for PWD, municipal road data | No | Open | High |
| 66 | **RTI4Empowerment** | https://rti4empowerment.org/ | RTI filing assistance, previous RTI responses | No | Open | Medium |

---

## A10. Government APIs & Technical Sources

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 67 | **data.gov.in API** | https://data.gov.in/ogdp-apis | Structured access to government datasets | Yes – REST (JSON/XML) | Open (API key) | ⭐ High |
| 68 | **DigiLocker API** | https://digilocker.gov.in/ | Document verification (contractor registration) | Yes – REST | Restricted | Medium |
| 69 | **India Post PIN Code API** | https://api.postalpincode.in/ | Pincode to district/state mapping | Yes – REST | Open/Free | ⭐ High |
| 70 | **UMANG API Gateway** | https://web.umang.gov.in/ | Unified govt service gateway | Yes – REST | Restricted | Medium |
| 71 | **API Setu** | https://apisetu.gov.in/ | Government API directory | Yes – Multiple | Open/Restricted | ⭐ High |
| 72 | **IUDX (India Urban Data Exchange)** | https://iudx.org.in/ | Urban datasets: traffic, road assets/quality, streetlights, parking | Yes – REST (Open Standard) | Open (registration) | ⭐ High |
| 73 | **NAPIX (NIC API eXchange)** | https://napix.gov.in/ | Centralized API management gateway for NIC e-governance apps | Yes – Gateway | Restricted (govt orgs) | High |
| 74 | **GeoSadak (PMGSY)** | https://geosadak-pmgsy.nic.in/opendata | Downloadable shapefiles for rural roads, habitations, DRRP layers | Shapefiles (GODL) | Open | ⭐ High |
| 75 | **Bharat Maps (NIC)** | https://bharatmaps.gov.in/ | Multi-layer GIS: NH, SH, major roads, GQ/NS/EW corridors | Yes – GIS services | Restricted (govt) | High |
| 76 | **Parivahan Sewa (Vahan/Sarathi)** | https://parivahan.gov.in/ | Vehicle registration, driver licenses, e-Challans, FASTag | Yes – REST via NAPIX | Restricted (formal approval) | High |
| 77 | **OpenCity.in** | https://data.opencity.in/ | Curated urban datasets: road statistics, motor vehicle data | Downloadable | Open | High |

---

## A11. Road Complaint & Citizen Apps

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 78 | **Meri Sadak App** | Google Play / App Store | Road condition reporting with geo-tagged photos for PMGSY roads | No | Open (mobile) | ⭐ High |
| 79 | **Rajmargyatra App (NHAI)** | Google Play / App Store | Route planner, toll rates, FASTag, complaint redressal, 1033 helpline | No | Open (mobile) | ⭐ High |
| 80 | **NHAI 1033 Helpline** | https://nhai.gov.in/ | 24/7 highway complaint/emergency helpline | No | Open | High |
| 81 | **Maharashtra Aaple Sarkar** | https://aaplesarkar.maharashtra.gov.in/ | State-level grievance portal covering PWD/road complaints | No | Open | High |

---

## A12. Road Safety Research & Databases

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 82 | **iRAD / eDAR** | https://parivahan.gov.in/ | Centralized digital accident repository, black spot identification (IIT Madras) | No (restricted) | Restricted | ⭐ High |
| 83 | **IndiaRAP** | https://indiarap.org/ | Road safety star ratings (1-5), Safe Corridor Demonstration data | No (reports) | Open | High |
| 84 | **CRRI (CSIR)** | https://crridom.gov.in/ | Research on pavement design, traffic engineering, road safety | No (publications) | Open | Medium |
| 85 | **TRIPP (IIT Delhi)** | https://tripp.iitd.ac.in/ | India Status Report on Road Safety, injury prevention research | No | Open | Medium |

---

## A13. Budget Analysis & Transparency

| # | Name | URL | Data Available | API? | Access | Relevance |
|---|------|-----|----------------|------|--------|-----------|
| 86 | **PRS Legislative Research** | https://prsindia.org/ | Demand for Grants analysis, CRIF allocation data, legislative analysis | No | Open | ⭐ High |
| 87 | **Indiastat** | https://indiastat.com/ | Year-wise statistical data on road lengths, types by state | No | Paid (subscription) | Medium |
| 88 | **Roads India** | https://roadsindia.co.in/ | PPP/EPC project info, traffic counts, toll data, NH shapefiles | No | Paid (subscription) | Medium |

---

# Part B: International & Technical APIs

## B1. International Road/Infrastructure Data

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 1 | **World Bank Open Data** | https://data.worldbank.org/ | Road statistics, infrastructure investment by country | Yes – REST | Free | High |
| 2 | **OECD Transport Statistics** | https://data.oecd.org/transport.htm | Road infrastructure, fatalities, transport spending | Yes – SDMX REST | Free | Medium |
| 3 | **IRF (Int'l Road Federation)** | https://www.irf.global/ | World Road Statistics for 200+ countries | No (paid reports) | Paid | Medium |
| 4 | **UN-Habitat Urban Data** | https://data.unhabitat.org/ | Urban infrastructure indicators, SDG 11 data | Yes – REST | Free | Medium |
| 5 | **AIIB** | https://www.aiib.org/ | Infrastructure project data across Asia | No | Free | Low |
| 6 | **African Dev. Bank Open Data** | https://dataportal.opendataforafrica.org/ | Road/transport infrastructure data for Africa | Yes – REST | Free | Low |

---

## B2. Mapping & GIS APIs

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 7 | **OpenStreetMap (Overpass)** | https://overpass-api.de/ | Full road network, types, surfaces, lanes | Yes – Overpass QL REST | Free | ⭐ High |
| 8 | **OSM Nominatim** | https://nominatim.openstreetmap.org/ | Geocoding & reverse geocoding from OSM | Yes – REST | Free (rate limited) | ⭐ High |
| 9 | **Mapbox** | https://www.mapbox.com/ | Tiles, geocoding, directions, traffic, static maps | Yes – REST & JS SDK | Freemium (50K/mo free) | ⭐ High |
| 10 | **Google Maps Platform** | https://developers.google.com/maps | Maps, geocoding, directions, places, Street View | Yes – REST & JS SDK | Freemium ($200/mo credit) | ⭐ High |
| 11 | **HERE Maps** | https://developer.here.com/ | Maps, routing, geocoding, traffic, fleet mgmt | Yes – REST | Freemium (250K tx/mo) | High |
| 12 | **TomTom Maps** | https://developer.tomtom.com/ | Maps, search, routing, traffic, geofencing | Yes – REST | Freemium (2,500 tx/day) | High |
| 13 | **MapTiler** | https://www.maptiler.com/ | Vector/raster tiles, geocoding | Yes – REST & JS SDK | Freemium | Medium |
| 14 | **Thunderforest** | https://www.thunderforest.com/ | Styled OSM tiles (transport, cycle, landscape) | Yes – tile API | Freemium (150K tiles/mo) | Medium |
| 15 | **Stadia Maps** | https://stadiamaps.com/ | Stylized map tiles | Yes – tile API | Freemium | Medium |
| 16 | **Esri ArcGIS** | https://www.esri.com/ | Enterprise GIS, road network analysis | Yes – REST & SDKs | Paid (free dev) | Medium |
| 17 | **Leaflet.js** | https://leafletjs.com/ | Open-source JS library for interactive maps | JS library | Free | ⭐ High |
| 18 | **MapLibre GL JS** | https://maplibre.org/ | Open-source vector map rendering | JS library | Free | High |

---

## B3. Weather APIs

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 19 | **OpenWeatherMap** | https://openweathermap.org/api | Current/forecast/historical weather, alerts | Yes – REST | Freemium (1K calls/day) | ⭐ High |
| 20 | **Open-Meteo** | https://open-meteo.com/ | Global weather, no API key required | Yes – REST | Free | ⭐ High |
| 21 | **IMD** | https://mausam.imd.gov.in/ | India-specific weather, cyclone warnings, rainfall | Limited (RSS) | Free | High |
| 22 | **Visual Crossing** | https://www.visualcrossing.com/ | Historical/current/forecast weather | Yes – REST | Freemium (1K records/day) | Medium |
| 23 | **Tomorrow.io** | https://www.tomorrow.io/ | Hyper-local weather, road weather intelligence | Yes – REST | Freemium | Medium |
| 24 | **Weatherbit** | https://www.weatherbit.io/ | Current/forecast/historical, air quality | Yes – REST | Freemium (50 calls/day) | Medium |

---

## B4. Traffic Data APIs

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 25 | **Google Maps Traffic Layer** | https://developers.google.com/maps | Real-time traffic overlay | Yes – JS SDK | Included in Maps | High |
| 26 | **TomTom Traffic** | https://developer.tomtom.com/traffic-api | Traffic flow, incidents, historical | Yes – REST | Freemium | High |
| 27 | **HERE Traffic** | https://developer.here.com/ | Traffic flow and incidents | Yes – REST | Freemium | High |
| 28 | **Waze for Cities (CCP)** | https://www.waze.com/wazeforcities | Crowdsourced traffic incidents, jams, closures | Partner program | Free for govts | ⭐ High |

---

## B5. Satellite Imagery

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 29 | **ESA Copernicus (Sentinel)** | https://dataspace.copernicus.eu/ | Sentinel-1 (SAR), Sentinel-2 (optical), 10m resolution | Yes – OData/STAC | Free | High |
| 30 | **USGS Landsat** | https://earthexplorer.usgs.gov/ | Landsat 8/9, 30m resolution, decades of history | Yes – REST (M2M) | Free | Medium |
| 31 | **ISRO Bhuvan (ResourceSat)** | https://bhuvan.nrsc.gov.in/ | Indian satellite imagery, LISS-III/IV | Limited (WMS) | Free | High |
| 32 | **Planet Labs** | https://www.planet.com/ | Daily high-res (3m) satellite imagery | Yes – REST | Paid (free for research) | Medium |
| 33 | **Maxar** | https://www.maxar.com/ | Very high resolution (<1m) imagery | Yes | Paid | Low |
| 34 | **GRIP Dataset** | https://www.globio.info/download-grip-dataset | Harmonized global road network shapefiles | No (download) | Free | High |
| 35 | **NISAR (NASA-ISRO SAR)** | https://nisar.jpl.nasa.gov/ | SAR for surface deformation, structural health | Yes (NASA DAAC) | Free | Medium |

---

## B6. Open Data Portals (Other Countries)

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 34 | **UK data.gov.uk** | https://www.data.gov.uk/ | Road network, traffic counts, accidents | Yes – CKAN | Free | High |
| 35 | **UK National Highways** | https://nationalhighways.co.uk/ | Strategic road network, road works, traffic | Some APIs | Free | High |
| 36 | **USA data.gov** | https://data.gov/ | Federal highway data, FHWA statistics | Yes – CKAN | Free | Medium |
| 37 | **USA FHWA** | https://www.fhwa.dot.gov/ | Highway statistics, bridge data, pavement conditions | Downloads | Free | Medium |
| 38 | **Bangladesh LGED** | http://www.lged.gov.bd/ | Local government roads, rural infrastructure | Limited | Free | Medium |
| 39 | **European Data Portal** | https://data.europa.eu/ | EU-wide road, transport data | Yes – SPARQL/REST | Free | Medium |
| 40 | **Australia data.gov.au** | https://data.gov.au/ | Road network, crash data | Yes – CKAN | Free | Low |
| 41 | **Canada Open Data** | https://open.canada.ca/ | National highway data | Yes – CKAN | Free | Low |

---

## B7. Road Safety Databases

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 42 | **WHO Global Road Safety** | https://www.who.int/ | Country-level fatality data, policy comparisons | No (reports) | Free | Medium |
| 43 | **iRAP** | https://www.irap.org/ | Star ratings for road safety | ViDA platform | Freemium | High |
| 44 | **IRTAD (OECD)** | https://www.itf-oecd.org/irtad | Crash data for 40+ countries | No (downloadable) | Free | Medium |
| 45 | **GRSF** | https://www.roadsafetyfacility.org/ | Road safety data, country profiles | No | Free | Low |

---

## B8. Construction & Quality Standards

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 46 | **Bureau of Indian Standards** | https://www.bis.gov.in/ | Road construction material standards | No | Paid | Medium |
| 47 | **IRC Specifications** | https://www.irc.nic.in/ | Road design/construction specs | No | Paid | Medium |
| 48 | **AASHTO** | https://www.transportation.org/ | American road standards | No | Paid | Low |
| 49 | **MoRTH Specifications** | https://morth.nic.in/ | Specifications for Road and Bridge Works | No (PDF) | Free | High |

---

## B9. Environmental Impact

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 49 | **CPCB** | https://cpcb.nic.in/ | Air quality index, ambient air quality near roads | Limited | Free | Medium |
| 50 | **OpenAQ** | https://openaq.org/ | Global real-time air quality data | Yes – REST (v3) | Free | Medium |
| 51 | **IQAir** | https://www.iqair.com/ | Real-time air quality, forecasts | Yes – REST | Freemium | Low |
| 52 | **PARIVESH Portal** | https://parivesh.nic.in/ | Environmental Impact Assessment for road projects | No (portal) | Free | Medium |

---

## B10. Geocoding APIs

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 52 | **Nominatim (OSM)** | https://nominatim.org/ | Free geocoding/reverse geocoding | Yes – REST | Free (rate limited) | ⭐ High |
| 53 | **Google Geocoding** | https://developers.google.com/maps/documentation/geocoding | Address ↔ coordinates | Yes – REST | Freemium ($200/mo) | High |
| 54 | **HERE Geocoder** | https://developer.here.com/ | Forward/reverse geocoding | Yes – REST | Freemium | Medium |
| 55 | **Mapbox Geocoding** | https://docs.mapbox.com/api/search/ | Forward/reverse geocoding | Yes – REST | Freemium | Medium |
| 56 | **LocationIQ** | https://locationiq.com/ | Geocoding, routing (OSM-based) | Yes – REST | Freemium (5K/day) | High |
| 57 | **Pelias** | https://github.com/pelias/pelias | Self-hosted geocoding engine | Self-hosted | Free | Medium |

---

## B11. SMS/Communication APIs

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 58 | **Twilio** | https://www.twilio.com/ | SMS, voice, WhatsApp, push | Yes – REST & SDKs | Pay-per-use | High |
| 59 | **MSG91** | https://msg91.com/ | SMS, OTP, WhatsApp (India-focused) | Yes – REST | Pay-per-use | ⭐ High |
| 60 | **Gupshup** | https://www.gupshup.io/ | WhatsApp Business, SMS, conversational | Yes – REST | Pay-per-use | High |
| 61 | **Firebase Cloud Messaging** | https://firebase.google.com/docs/cloud-messaging | Push notifications (web + mobile) | Yes – REST & SDK | Free | ⭐ High |
| 62 | **Web Push API** | https://developer.mozilla.org/en-US/docs/Web/API/Push_API | Browser-native push (PWA) | Browser API (VAPID) | Free | ⭐ High |
| 63 | **SendGrid** | https://sendgrid.com/ | Transactional email | Yes – REST | Freemium (100/day) | Medium |

---

## B12. AI/ML APIs for Road Analysis

| # | Name | URL | Data/Service | API? | Pricing | Relevance |
|---|------|-----|--------------|------|---------|-----------|
| 64 | **Google Cloud Vision** | https://cloud.google.com/vision | Image classification, object detection | Yes – REST | Pay-per-use | High |
| 65 | **AWS Rekognition** | https://aws.amazon.com/rekognition/ | Custom labels for road defect detection | Yes – REST | Pay-per-use | Medium |
| 66 | **Azure Computer Vision** | https://azure.microsoft.com/ | Image analysis, OCR (sign detection) | Yes – REST | Pay-per-use | Medium |
| 67 | **Roboflow** | https://roboflow.com/ | Pre-trained pothole detection models | Yes – REST & SDK | Freemium (1K/mo) | ⭐ High |
| 68 | **Hugging Face** | https://huggingface.co/ | Open-source ML models for road detection | Yes – Inference API | Freemium | High |
| 69 | **TensorFlow.js** | https://www.tensorflow.org/js | Client-side ML inference (offline pothole detection) | JS library | Free | Medium |
| 70 | **Google Gemini API** | https://ai.google.dev/ | Multimodal AI for road image analysis, chatbot | Yes – REST | Freemium | ⭐ High |
| 71 | **OpenAI API** | https://platform.openai.com/ | GPT-4o for chatbot, Vision for image analysis | Yes – REST | Pay-per-use | High |
| 72 | **Anthropic Claude API** | https://www.anthropic.com/api | Claude for chatbot, strong reasoning | Yes – REST | Pay-per-use | High |
| 73 | **YOLO (Ultralytics)** | https://docs.ultralytics.com/ | Real-time object detection for pothole/road damage | Python library | Free (AGPL) | ⭐ High |
| 74 | **TensorFlow / TF Lite** | https://www.tensorflow.org/ | ML framework with edge/mobile deployment | Python/C++ library | Free (Apache 2.0) | High |

---

# Part C: News & Media Sources

## C1. Major Indian News (National)

| # | Name | URL | API/RSS? | India Coverage | Relevance |
|---|------|-----|----------|----------------|-----------|
| 1 | **NDTV** | https://www.ndtv.com/ | RSS feeds | Strong | High |
| 2 | **Times of India** | https://timesofindia.indiatimes.com/ | RSS feeds | Strong | High |
| 3 | **The Hindu** | https://www.thehindu.com/ | RSS feeds | Strong | High |
| 4 | **Indian Express** | https://indianexpress.com/ | RSS feeds | Strong | High |
| 5 | **Hindustan Times** | https://www.hindustantimes.com/ | RSS feeds | Strong | Medium |
| 6 | **Economic Times** | https://economictimes.indiatimes.com/ | RSS feeds | Strong | High |
| 7 | **Mint** | https://www.livemint.com/ | RSS feeds | Strong | Medium |
| 8 | **Business Standard** | https://www.business-standard.com/ | RSS feeds | Strong | Medium |
| 9 | **The Wire** | https://thewire.in/ | RSS feed | Strong | High |
| 10 | **Scroll.in** | https://scroll.in/ | RSS feed | Strong | Medium |
| 11 | **The Print** | https://theprint.in/ | RSS feed | Strong | Medium |
| 12 | **Deccan Herald** | https://www.deccanherald.com/ | RSS feeds | Strong | Medium |

---

## C2. Regional Language News

| # | Name | URL | Language | RSS? | Coverage | Relevance |
|---|------|-----|----------|------|----------|-----------|
| 13 | **Ananda Bazar Patrika** | https://www.anandabazar.com/ | Bengali | RSS | Strong (WB) | High |
| 14 | **Ei Samay** | https://eisamay.com/ | Bengali | RSS | Strong (WB) | Medium |
| 15 | **Bartaman** | https://bartamanpatrika.com/ | Bengali | Limited | Strong (WB) | Medium |
| 16 | **Dinamani** | https://www.dinamani.com/ | Tamil | RSS | Strong (TN) | Medium |
| 17 | **Dinakaran** | https://www.dinakaran.com/ | Tamil | Limited | Strong (TN) | Medium |
| 18 | **Dainik Bhaskar** | https://www.bhaskar.com/ | Hindi | RSS | Strong (Hindi belt) | High |
| 19 | **Amar Ujala** | https://www.amarujala.com/ | Hindi | RSS | Strong (North) | Medium |
| 20 | **Navbharat Times** | https://navbharattimes.indiatimes.com/ | Hindi | RSS | Strong (Hindi belt) | Medium |
| 21 | **Dainik Jagran** | https://www.jagran.com/ | Hindi | RSS | Strong (North) | Medium |
| 22 | **Loksatta** | https://www.loksatta.com/ | Marathi | RSS | Strong (MH) | Medium |
| 23 | **Maharashtra Times** | https://maharashtratimes.com/ | Marathi | RSS | Strong (MH) | Medium |
| 24 | **Eenadu** | https://www.eenadu.net/ | Telugu | Limited | Strong (AP/TS) | Medium |
| 25 | **Sakshi** | https://www.sakshi.com/ | Telugu | RSS | Strong (AP/TS) | Medium |
| 26 | **Prajavani** | https://www.prajavani.net/ | Kannada | RSS | Strong (KA) | Medium |
| 27 | **Vijaya Karnataka** | https://vijaykarnataka.com/ | Kannada | RSS | Strong (KA) | Medium |

---

## C3. News Aggregation APIs

| # | Name | URL | API? | Pricing | India Coverage | Relevance |
|---|------|-----|------|---------|----------------|-----------|
| 28 | **NewsAPI.org** | https://newsapi.org/ | Yes – REST | Free dev (100 req/day) / $449/mo | Strong | ⭐ High |
| 29 | **GNews API** | https://gnews.io/ | Yes – REST | Freemium (100 req/day) | Strong | ⭐ High |
| 30 | **MediaStack** | https://mediastack.com/ | Yes – REST | Freemium (500 req/mo) | Moderate | Medium |
| 31 | **Currents API** | https://currentsapi.services/ | Yes – REST | Free (600 req/day) | Moderate | Medium |
| 32 | **NewsCatcher API** | https://newscatcherapi.com/ | Yes – REST | Freemium | Strong | High |
| 33 | **GDELT Project** | https://www.gdeltproject.org/ | Yes – REST (BigQuery) | Free | Strong | ⭐ High |
| 34 | **Event Registry** | https://eventregistry.org/ | Yes – REST | Freemium | Moderate | Medium |
| 35 | **Aylien News API** | https://aylien.com/news-api | Yes – REST | Paid (trial) | Moderate | Medium |
| 36 | **Contextual Web Search** | https://contextualweb.io/ | Yes – REST (RapidAPI) | Freemium | Limited | Low |

---

## C4. Infrastructure/Construction News

| # | Name | URL | RSS? | India Coverage | Relevance |
|---|------|-----|------|----------------|-----------|
| 37 | **Construction Week India** | https://www.constructionweekonline.in/ | RSS | Strong | ⭐ High |
| 38 | **Infrastructure Today** | https://www.infrastructuretoday.co.in/ | Limited | Strong | High |
| 39 | **Roads & Highways (NBM)** | https://www.nbmcw.com/roads-and-highways.html | Limited RSS | Strong | High |
| 40 | **IANS Infra Wire** | https://ians.in/ | Subscription | Strong | Medium |
| 41 | **ET Infra** | https://infra.economictimes.indiatimes.com/ | RSS | Strong | ⭐ High |

---

## C5. International News APIs

| # | Name | URL | API? | Pricing | Relevance |
|---|------|-----|------|---------|-----------|
| 42 | **The Guardian** | https://open-platform.theguardian.com/ | Yes – REST (free key) | Free (non-commercial) | Medium |
| 43 | **New York Times** | https://developer.nytimes.com/ | Yes – REST | Free (rate limited) | Low |
| 44 | **BBC News** | https://www.bbc.com/news/10628494 | RSS only | Free | Medium |
| 45 | **Reuters** | https://www.reuters.com/ | No public API | Paid | Low |
| 46 | **Associated Press** | https://www.ap.org/ | No public API | Paid | Low |

---

## C6. Fact-Checking Sources

| # | Name | URL | API? | India Coverage | Relevance |
|---|------|-----|------|----------------|-----------|
| 47 | **Alt News** | https://www.altnews.in/ | RSS | Strong | Medium |
| 48 | **Boom Live** | https://www.boomlive.in/ | RSS | Strong | Medium |
| 49 | **India Today Fact Check** | https://www.indiatoday.in/fact-check | RSS | Strong | Medium |
| 50 | **Google Fact Check Tools** | https://toolbox.google.com/factcheck/explorer | Yes – REST | Global | Medium |

---

## C7. Social Media Monitoring APIs

| # | Name | URL | API? | Pricing | Relevance |
|---|------|-----|------|---------|-----------|
| 51 | **Twitter/X API v2** | https://developer.x.com/ | Yes – REST | Basic: $100/mo | ⭐ High |
| 52 | **Reddit API** | https://www.reddit.com/dev/api/ | Yes – REST (OAuth) | Free (rate limited) | Medium |
| 53 | **Facebook Graph API** | https://developers.facebook.com/ | Yes – REST | Free (restricted) | Medium |
| 54 | **Instagram Graph API** | https://developers.facebook.com/docs/instagram-api/ | Yes – REST | Free (business) | Low |
| 55 | **Brand24** | https://brand24.com/ | Yes – REST | Paid ($79/mo+) | Medium |
| 56 | **Mention** | https://mention.com/ | Yes – REST | Paid | Low |

---

## C8. Crowdsourced Reporting Platforms

| # | Name | URL | API? | India Coverage | Relevance |
|---|------|-----|------|----------------|-----------|
| 57 | **FixMyStreet** | https://www.fixmystreet.com/ | Yes – REST (open source) | Limited (UK, forkable) | ⭐ High |
| 58 | **SeeClickFix** | https://seeclickfix.com/ | Yes – REST | Limited (USA) | Medium |
| 59 | **Swachhata App** | https://swachhbharatmission.gov.in/ | No | Strong | Medium |
| 60 | **MyGov India** | https://www.mygov.in/ | No | Strong | Medium |
| 61 | **Janaagraha (I Change My City)** | https://www.ichangemycity.com/ | No | Strong (select cities) | ⭐ High |
| 62 | **OpenStreetMap Community** | https://www.openstreetmap.org/ | Yes – Overpass API | Strong | ⭐ High |
| 63 | **Waze Community Reports** | https://www.waze.com/ | Via CCP | Strong | ⭐ High |
| 64 | **CivicFeed** | Various platforms | Varies | Limited | Low |
| 65 | **Pothole Tracker Apps** | Various regional apps | Varies | Moderate | High |
| 66 | **Swachhata-MoHUA** | https://swachhata.mohua.gov.in/ | No | Strong (1000s of cities) | ⭐ High |
| 67 | **MapmyIndia / Mappls** | https://www.mappls.com/ | Yes – REST (free tier) | Strong (India leader) | ⭐ High |
| 68 | **Locobuzz** | https://www.locobuzz.com/ | Yes – API | Strong (India-focused) | High |
| 69 | **NewsData.io** | https://newsdata.io/ | Yes – REST | Very Strong (Indian languages) | ⭐ High |

---

# MVP Priority Matrix

> [!IMPORTANT]
> These are the **top-priority data sources** to integrate for the RoadWatch MVP (Stage 1 deadline: 31st May 2026).

## Tier 1 — Must Have (MVP Core)

| Source | Category | Why |
|--------|----------|-----|
| **OpenStreetMap (Overpass API)** | Mapping | Free road network data — roads, types, surfaces, lanes |
| **Leaflet.js / MapLibre GL** | Mapping | Free map rendering for PWA |
| **Nominatim** | Geocoding | Free geocoding for location resolution |
| **data.gov.in API** | Govt Data | Single largest structured data source for Indian roads |
| **PMGSY OMMS** | Govt Data | Rural road data with contractor info and expenditure |
| **India Post PIN Code API** | Utility | Free pincode → district/state mapping |
| **Firebase Cloud Messaging** | Communication | Free push notifications |
| **Web Push API** | Communication | Browser-native push for PWA |
| **Open-Meteo** | Weather | Free weather API, no key needed |
| **Claude/Gemini/OpenAI API** | AI | Chatbot backend |

## Tier 2 — Should Have (Enhanced MVP)

| Source | Category | Why |
|--------|----------|-----|
| **PMGSY GIS** | Govt GIS | GIS mapping of rural roads (WMS/WMTS) |
| **ISRO Bhuvan** | Satellite/GIS | Indian satellite imagery and map services |
| **Open Budgets India** | Budget | Machine-readable budget data with API |
| **eProcure** | Tenders | Contractor bidding data |
| **OpenWeatherMap** | Weather | Rich weather data with good free tier |
| **MSG91** | SMS/OTP | India-focused affordable SMS for engineer auth |
| **LocationIQ** | Geocoding | Generous free tier, OSM-based |
| **Roboflow** | AI/ML | Pre-trained pothole detection models |
| **NewsAPI.org** | News | Infrastructure news aggregation |
| **GDELT Project** | News | Free geo-tagged event database |

## Tier 3 — Nice to Have (Post-MVP)

| Source | Category | Why |
|--------|----------|-----|
| **Google Maps Platform** | Mapping | Premium maps, Street View |
| **Waze for Cities** | Traffic | Free crowdsourced traffic data |
| **ESA Copernicus Sentinel** | Satellite | Free satellite imagery for road monitoring |
| **Twitter/X API** | Social | Civic complaint monitoring |
| **FixMyStreet (open source)** | Reference | Complaint system design reference |
| **CAG Audit Reports** | Budget | Budget utilization audit data |
| **State PWD Portals** | Govt Data | State-specific road data |
| **RSS Feeds (News)** | News | Infrastructure news from multiple sources |

---

## Summary Statistics

| Domain | Sources |
|--------|---------|
| 🇮🇳 Indian Government Data Sources | 88 |
| 🌍 International & Technical APIs | 78 |
| 📰 News & Media Sources | 69 |
| **Total** | **235** |

---

> [!TIP]
> For the MVP demo, focus on **Tier 1 sources** which are all free/freemium. Manually seed 20-30 roads in West Bengal and Tamil Nadu using data from PMGSY OMMS and OpenStreetMap Overpass API. Use Open Budgets India for realistic budget figures.

---

*Compiled for RoadWatch — IIT Madras COERS Hackathon 2026 | Problem Statement 1.2*
*Last updated: 22 May 2026*
