const url = 'https://apis.data.go.kr/B551011/KorService2/searchFestival1?serviceKey=q8wN3K6A%2BR%2FlmXgZ%2FE7H%2F6xQO381Dk%2BQyM2ZtV0vCq5iM%2FCy%2BiBq%2BEeJ2dZ2yX%2F%2B8dC4E%2BA8A4W%2BDX%2BDaF%2BGQw%3D%3D&MobileOS=ETC&MobileApp=ieum&_type=json&eventStartDate=20240401&numOfRows=1&pageNo=1&arrange=A';
fetch(url)
  .then(res => res.text())
  .then(text => console.log(text.substring(0, 500)))
  .catch(err => console.error(err));
