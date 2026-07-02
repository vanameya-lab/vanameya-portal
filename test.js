async function test() {
  const res = await fetch('http://localhost:3000/api/payments');
  const json = await res.json();
  const id = json.data[0].id;
  console.log("ID:", id);
  const res2 = await fetch('http://localhost:3000/api/sales/' + id);
  const text = await res2.text();
  console.log("Response:", text);
}
test();
