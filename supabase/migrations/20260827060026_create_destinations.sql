-- 다이빙 목적지 데이터를 lib/destinations/data.ts의 정적 배열에서 옮겨온다.
-- docs/decisions/travel-data-source.md 참고 (2026-08-27 갱신: 데이터베이스로 전환).

create table public.destinations (
  id text primary key,
  name text not null,
  country text not null,
  region text not null,
  distance_km integer not null,
  lat double precision not null,
  lng double precision not null,
  flight jsonb not null,
  local_transfer text not null,
  local_transfer_short text not null,
  styles text[] not null default '{}',
  condition jsonb not null,
  reason jsonb not null default '{}',
  dive_prices numeric[] not null,
  gear numeric not null,
  liveaboard jsonb,
  lodging jsonb not null,
  maps text not null,
  created_at timestamptz not null default now()
);

alter table public.destinations enable row level security;

create policy "destinations are publicly readable"
on public.destinations
for select
to anon, authenticated
using (true);

-- 2026-04-28부로 public 스키마의 새 테이블은 Data API에 자동 노출되지 않으므로 명시적으로 grant한다.
grant select on public.destinations to anon, authenticated;

insert into public.destinations
  (id, name, country, region, distance_km, lat, lng, flight, local_transfer, local_transfer_short, styles, condition, reason, dive_prices, gear, liveaboard, lodging, maps)
values
  ('anilao', '아닐라오', '필리핀', '필리핀', 2600, 13.75, 120.9,
    '{"transfer":"직항","priceMin":48,"priceMax":65,"destinationAirport":"마닐라"}',
    '마닐라 공항에서 육로로 약 3시간', '육로 3시간',
    ARRAY['매크로','초급자'],
    '{"optimal":[12,1,2,3,4],"good":[5,6,7,8,9,10,11],"poor":[]}',
    '{"optimal":"12～4월은 건기라 파도가 잔잔하고 시야가 좋아 매크로 생물을 관찰하기 좋습니다.","good":"우기철이지만 만 지형이라 큰 영향은 적고, 다이빙 자체엔 무리가 없습니다."}',
    ARRAY[4.0,3.5,3.3,3.0], 1.5, null,
    '{"shop":[3.0,4.5],"separate":[3.5,7.0]}',
    'https://www.google.com/maps/search/anilao+dive+shop'),

  ('cebu-moalboal', '세부 · 모알보알', '필리핀', '필리핀', 2700, 9.94, 123.4,
    '{"transfer":"직항","priceMin":55,"priceMax":75,"destinationAirport":"세부"}',
    '세부 공항에서 모알보알까지 육로로 약 3～4시간', '육로 3～4시간',
    ARRAY['초급자','매크로'],
    '{"optimal":[12,1,2,3,4,5],"good":[6,7,8,9,10,11],"poor":[]}',
    '{"optimal":"12～5월 건기에는 정어리떼 활동이 활발하고 시야가 20m 이상으로 좋습니다.","good":"우기에도 다이빙은 가능하지만 비가 잦아 시야가 다소 흐려질 수 있습니다."}',
    ARRAY[4.5,4.0,3.8,3.5], 1.5, null,
    '{"shop":[3.5,5.0],"separate":[4.0,9.0]}',
    'https://www.google.com/maps/search/moalboal+dive+shop'),

  ('bohol', '보홀 · 발리카삭', '필리핀', '필리핀', 2750, 9.52, 123.71,
    '{"transfer":"직항","priceMin":55,"priceMax":78,"destinationAirport":"보홀"}',
    '보홀 공항에서 다이빙샵까지 육로 약 1시간, 발리카삭 섬까지 보트로 15～20분 추가', '육로 1시간+보트 20분',
    ARRAY['대물','드리프트','초급자'],
    '{"optimal":[12,1,2,3,4,5],"good":[6,7,8,9,10,11],"poor":[]}',
    '{"optimal":"12～5월 건기에는 발리카삭 드롭오프의 시야가 가장 좋고 바다거북 조우율이 높습니다.","good":"우기엔 조류가 다소 강해질 수 있으나 드리프트 다이빙 자체는 가능합니다."}',
    ARRAY[4.2,3.7,3.5,3.3], 1.5, null,
    '{"shop":[3.2,4.8],"separate":[3.8,8.0]}',
    'https://www.google.com/maps/search/balicasag+dive+shop'),

  ('koh-tao', '코타오', '태국', '태국', 3700, 10.1, 99.84,
    '{"transfer":"경유","priceMin":50,"priceMax":70,"transferAirport":"방콕","destinationAirport":"코사무이"}',
    '코사무이 공항에서 코타오까지 페리로 약 1.5～2시간', '페리 1.5～2시간',
    ARRAY['초급자','매크로'],
    '{"optimal":[3,4,5,6,7,8,9],"good":[12,1,2],"poor":[10,11]}',
    '{"optimal":"건기(3～9월)엔 수온이 따뜻하고 파도가 잔잔해 초급자 교육·펀다이빙 모두 적합합니다.","good":"12～2월은 선선하지만 다이빙 컨디션 자체엔 큰 무리가 없습니다.","poor":"10～11월은 몬순 영향으로 시야가 크게 나빠지고 파도가 거세집니다."}',
    ARRAY[3.8,3.33,3.1,2.9], 1.2, null,
    '{"shop":[2.5,4.0],"separate":[3.0,6.0]}',
    'https://www.google.com/maps/search/koh+tao+dive+shop'),

  ('phi-phi', '피피 · 코란타', '태국', '태국', 3750, 7.74, 98.77,
    '{"transfer":"경유","priceMin":48,"priceMax":68,"transferAirport":"방콕","destinationAirport":"끄라비"}',
    '끄라비 공항에서 항구까지 육로 약 30분, 피피섬까지 스피드보트로 약 1.5시간', '육로+보트 2시간',
    ARRAY['초급자','대물'],
    '{"optimal":[11,12,1,2,3,4],"good":[5,10],"poor":[6,7,8,9]}',
    '{"optimal":"건기(11～4월)엔 마야베이와 리차드슨록 시야가 좋고 레오파드샤크 조우율이 높습니다.","good":"환절기라 파도가 다소 있지만 다이빙은 무리 없이 가능합니다.","poor":"우기(6～9월) 몬순으로 스웰이 강해지고 시야가 크게 줄어듭니다."}',
    ARRAY[3.6,3.2,3.0,2.8], 1.2, null,
    '{"shop":[2.8,4.2],"separate":[3.2,6.5]}',
    'https://www.google.com/maps/search/phi+phi+dive+shop'),

  ('similan', '시밀란 제도', '태국', '태국', 3900, 8.65, 97.64,
    '{"transfer":"경유","priceMin":55,"priceMax":80,"transferAirport":"방콕","destinationAirport":"푸켓"}',
    '푸켓 공항에서 승선지(카오락)까지 육로 약 1.5시간, 시밀란 해상까지 보트로 약 1～2시간', '육로+보트 3시간',
    ARRAY['대물','드리프트','조류'],
    '{"optimal":[12,1,2,3],"good":[11,4],"poor":[5,6,7,8,9,10]}',
    '{"optimal":"국립공원 개장 시즌(11～4월) 중에서도 12～3월은 리브어보드 운항이 가장 활발합니다.","good":"개장 초반·막바지라 리브어보드 선택지가 다소 줄어듭니다.","poor":"5～10월은 국립공원이 폐쇄되어 다이빙 자체가 불가능합니다."}',
    ARRAY[7.0,6.33,5.8,5.5], 2.0,
    '{"months":[11,12,1,2,3,4],"priceMin":22,"priceMax":35}',
    '{"shop":[5.0,8.0],"separate":[6.0,12.0]}',
    'https://www.google.com/maps/search/similan+liveaboard'),

  ('sipadan', '시파단 · 마부', '말레이시아', '말레이시아', 4200, 4.12, 118.63,
    '{"transfer":"경유","priceMin":65,"priceMax":95,"transferAirport":"코타키나발루","destinationAirport":"타와우"}',
    '타와우 공항에서 셈포르나까지 육로 약 1.5시간, 마부·시파단까지 보트로 약 30～45분', '육로+보트 2시간',
    ARRAY['대물','드리프트','조류'],
    '{"optimal":[4,5,6,7,8,9],"good":[10,11,12,1,2,3],"poor":[]}',
    '{"optimal":"건기(4～9월)엔 조류가 예측 가능한 수준이라 바라쿠다 토네이도 조우율이 높습니다.","good":"우기철엔 조류가 거세지고 시야가 다소 줄어들 수 있습니다."}',
    ARRAY[6.0,5.5,5.2,4.9], 2.0,
    '{"months":[4,5,6,7,8,9,10],"priceMin":18,"priceMax":28}',
    '{"shop":[6.0,9.0],"separate":[7.0,15.0]}',
    'https://www.google.com/maps/search/sipadan+mabul+dive'),

  ('layang-layang', '라양라양', '말레이시아', '말레이시아', 4400, 7.37, 113.83,
    '{"transfer":"경유","priceMin":78,"priceMax":110,"transferAirport":"코타키나발루","destinationAirport":"라양라양"}',
    '공항이 섬 안에 있어 도착 후 리조트까지 도보로 이동', '도보 이동',
    ARRAY['대물','드리프트'],
    '{"optimal":[3,4,5,6],"good":[7,8,9,10],"poor":[11,12,1,2]}',
    '{"optimal":"해머헤드 시즌(3～6월)엔 새벽 드롭오프 다이빙에서 조우율이 가장 높습니다.","good":"시즌 외엔 대물 조우가 줄지만 절벽 드롭오프 다이빙 자체는 가능합니다.","poor":"몬순 시즌(11～2월)은 파도가 높아 리조트가 사실상 휴업합니다."}',
    ARRAY[8.5,7.7,7.2,6.8], 2.2, null,
    '{"shop":[8.0,14.0],"separate":[9.0,16.0]}',
    'https://www.google.com/maps/search/layang+layang+resort'),

  ('lembeh', '렘베 · 방카섬', '인도네시아', '인도네시아', 4700, 1.47, 125.23,
    '{"transfer":"경유","priceMin":75,"priceMax":105,"transferAirport":"자카르타","destinationAirport":"마나도"}',
    '마나도 공항에서 렘베 해협 리조트까지 육로로 약 1시간', '육로 1시간',
    ARRAY['매크로','초급자'],
    '{"optimal":[4,5,6,7,8,9,10,11],"good":[12,1,2,3],"poor":[]}',
    '{"optimal":"건기(4～11월)엔 머드다이빙 시야가 안정적이라 희귀 매크로 생물 관찰에 좋습니다.","good":"우기엔 빗물 유입으로 부유물이 늘어 시야가 다소 줄어듭니다."}',
    ARRAY[5.5,5.0,4.7,4.4], 1.8, null,
    '{"shop":[5.5,9.0],"separate":[5.0,10.0]}',
    'https://www.google.com/maps/search/lembeh+dive+resort'),

  ('nusa-penida', '누사페니다', '인도네시아', '인도네시아', 5300, -8.73, 115.54,
    '{"transfer":"직항","priceMin":60,"priceMax":85,"destinationAirport":"발리"}',
    '발리 공항에서 사누르 항까지 육로 약 1시간, 누사페니다까지 스피드보트로 약 30～45분', '육로+보트 1.5시간',
    ARRAY['대물','조류','초급자'],
    '{"optimal":[7,8,9,10],"good":[11,12,1,2,3,4,5,6],"poor":[]}',
    '{"optimal":"몰라몰라 시즌(7～10월)엔 한류가 유입돼 개복치 조우율이 크게 높아집니다.","good":"그 외 기간은 몰라몰라 대신 만타포인트 위주로 다이빙하게 됩니다."}',
    ARRAY[5.0,4.5,4.2,3.9], 1.6, null,
    '{"shop":[4.5,7.0],"separate":[4.0,9.0]}',
    'https://www.google.com/maps/search/nusa+penida+dive+shop'),

  ('komodo', '코모도', '인도네시아', '인도네시아', 5700, -8.55, 119.48,
    '{"transfer":"경유","priceMin":80,"priceMax":115,"transferAirport":"발리(덴파사르)","destinationAirport":"라부안바조"}',
    '라부안바조 공항에서 항구까지 육로 약 15～20분, 리브어보드는 항구에서 승선', '육로 20분',
    ARRAY['대물','드리프트','조류'],
    '{"optimal":[4,5,6,7,8,9,10,11],"good":[12,1,2,3],"poor":[]}',
    '{"optimal":"건기(4～11월)엔 코모도 남부 조류 다이빙 컨디션이 안정적이고 만타 조우율이 높습니다.","good":"우기엔 스웰이 커지고 포인트 간 이동이 다소 불편해집니다."}',
    ARRAY[7.5,6.67,6.2,5.8], 2.0,
    '{"months":[1,2,3,4,5,6,7,8,9,10,11,12],"priceMin":28,"priceMax":45}',
    '{"shop":[7.0,12.0],"separate":[6.0,15.0]}',
    'https://www.google.com/maps/search/komodo+liveaboard'),

  ('raja-ampat', '라자암팟', '인도네시아', '인도네시아', 6300, -0.55, 130.83,
    '{"transfer":"경유","priceMin":95,"priceMax":140,"transferAirport":"자카르타","destinationAirport":"소롱"}',
    '소롱 항에서 와이삭까지 페리로 약 2～4시간, 이후 리조트까지 보트로 추가 이동', '페리 2～4시간+',
    ARRAY['대물','매크로','조류'],
    '{"optimal":[10,11,12,1,2,3,4],"good":[5,6,7,8,9],"poor":[]}',
    '{"optimal":"건기(10～4월)엔 시야가 가장 좋고 세계 최고 수준의 생물다양성을 관찰할 수 있습니다.","good":"남동 몬순 시즌(5～9월)은 조류가 강해지지만 다이빙 자체는 충분히 가능합니다."}',
    ARRAY[9.0,8.0,7.5,7.0], 2.5,
    '{"months":[1,2,3,4,5,6,7,8,9,10,11,12],"priceMin":35,"priceMax":60}',
    '{"shop":[10.0,18.0],"separate":[8.0,20.0]}',
    'https://www.google.com/maps/search/raja+ampat+liveaboard');
