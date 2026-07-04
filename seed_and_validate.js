

const BASE_URL = "http://localhost:5050/api";

const STATIONS = ["Ikeja Station", "Lekki Station", "Apapa Station"];
const FUEL_TYPES = ["PMS", "AGO", "DPK"];


const PRICE_RANGES = {
  PMS: [1150, 1300],
  AGO: [1350, 1500],
  DPK: [1000, 1150],
};

const DAILY_VOLUME_RANGES = {
  PMS: [800, 1600],
  AGO: [300, 700],
  DPK: [50, 150],
};

const INITIAL_DELIVERY_QTY = {
  PMS: 25000,
  AGO: 12000,
  DPK: 5000,
};

const SIM_DAYS = 30;
const START_DATE = new Date("2026-06-01");

let token = null;
const expected = {
  inventory: {}, 
  totalRevenue: 0,
  fuelSold: {}, 
  stationRevenue: {}, 
  salesCount: 0,
  deliveriesCount: 0,
  rejectedOversell: 0,
};

function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function dateStr(d) {
  return d.toISOString().split("T")[0];
}

async function api(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@petroflow.test",
      password: "AdminPass123!",
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Login failed: " + JSON.stringify(data));
  token = data.token;
  console.log("✔ Authenticated as Admin");
}

async function seedSuppliers() {
  const suppliers = [
    { supplier_name: "Techno Oil Ltd", fuel_type: "PMS", contact_person: "B. Adeyemi", phone: "08012345001", email: "supply@technooil.test", status: "Active" },
    { supplier_name: "Rainoil Ltd", fuel_type: "AGO", contact_person: "C. Okoro", phone: "08012345002", email: "supply@rainoil.test", status: "Active" },
    { supplier_name: "Ardova Plc", fuel_type: "DPK", contact_person: "F. Musa", phone: "08012345003", email: "supply@ardova.test", status: "Active" },
  ];
  for (const s of suppliers) {
    const r = await api("POST", "/suppliers", s);
    if (r.status >= 400) throw new Error("Supplier seed failed: " + JSON.stringify(r.data));
  }
  console.log(`✔ Seeded ${suppliers.length} suppliers`);
}

async function seedInitialDeliveries() {
  const supplierByFuel = { PMS: "Techno Oil Ltd", AGO: "Rainoil Ltd", DPK: "Ardova Plc" };
  for (const station of STATIONS) {
    for (const fuel of FUEL_TYPES) {
      const qty = INITIAL_DELIVERY_QTY[fuel];
      const r = await api("POST", "/deliveries", {
        supplier_name: supplierByFuel[fuel],
        destination: station,
        fuel_type: fuel,
        quantity: qty,
        delivery_date: dateStr(START_DATE),
        driver_name: "Test Driver",
        truck_number: "LND-100XY",
        status: "Delivered",
      });
      if (r.status >= 400) throw new Error("Delivery seed failed: " + JSON.stringify(r.data));

      const key = `${station}|${fuel}`;
      expected.inventory[key] = (expected.inventory[key] || 0) + qty;
      expected.deliveriesCount++;
    }
  }
  console.log(`✔ Seeded ${expected.deliveriesCount} initial deliveries (bulk stock-up)`);
}

async function seedPrices() {
  for (const station of STATIONS) {
    for (const fuel of FUEL_TYPES) {
      const [min, max] = PRICE_RANGES[fuel];
      const newPrice = rand(min, max);
      const r = await api("POST", "/prices", {
        station_name: station,
        fuel_type: fuel,
        previous_price: rand(min, max),
        new_price: newPrice,
        effective_date: dateStr(START_DATE),
        approved_by: "Test Admin",
      });
      if (r.status >= 400) throw new Error("Price seed failed: " + JSON.stringify(r.data));
      PRICE_RANGES[fuel]._current = PRICE_RANGES[fuel]._current || {};
      PRICE_RANGES[fuel]._current[station] = newPrice;
    }
  }
  console.log("✔ Seeded initial prices per station/fuel");
}

async function simulateSalesDay(dayOffset) {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + dayOffset);
  const dateString = dateStr(date);

  for (const station of STATIONS) {
    for (const fuel of FUEL_TYPES) {
      const [minV, maxV] = DAILY_VOLUME_RANGES[fuel];
      const qtySold = rand(minV, maxV);
      const pricePerLitre = PRICE_RANGES[fuel]._current[station];
      const totalAmount = Math.round(qtySold * pricePerLitre * 100) / 100;

      const key = `${station}|${fuel}`;
      const currentStock = expected.inventory[key] || 0;

      const r = await api("POST", "/sales", {
        station_name: station,
        fuel_type: fuel,
        quantity_sold: qtySold,
        price_per_litre: pricePerLitre,
        total_amount: totalAmount,
        sales_date: dateString,
        payment_method: "Card",
      });

      if (currentStock < qtySold) {
        
        if (r.status < 400) {
          throw new Error(`UNEXPECTED: oversell accepted at ${key} on ${dateString}`);
        }
        expected.rejectedOversell++;
        continue;
      }

      if (r.status >= 400) {
        throw new Error("Sale failed unexpectedly: " + JSON.stringify(r.data));
      }

      expected.inventory[key] = currentStock - qtySold;
      expected.totalRevenue += totalAmount;
      expected.fuelSold[fuel] = (expected.fuelSold[fuel] || 0) + qtySold;
      expected.stationRevenue[station] = (expected.stationRevenue[station] || 0) + totalAmount;
      expected.salesCount++;
    }
  }
}

async function forceOversellTest() {

  const station = STATIONS[0];
  const fuel = FUEL_TYPES[0];
  const key = `${station}|${fuel}`;
  const currentStock = expected.inventory[key] || 0;
  const oversellQty = currentStock + 100000;

  const r = await api("POST", "/sales", {
    station_name: station,
    fuel_type: fuel,
    quantity_sold: oversellQty,
    price_per_litre: PRICE_RANGES[fuel]._current[station],
    total_amount: oversellQty * PRICE_RANGES[fuel]._current[station],
    sales_date: dateStr(START_DATE),
    payment_method: "Cash",
  });

  console.log(
    r.status === 400
      ? "✔ Oversell correctly rejected (400): " + r.data.error
      : `✘ UNEXPECTED oversell response (status ${r.status}): ${JSON.stringify(r.data)}`
  );
  return r.status === 400;
}

async function fetchActual() {
  const inv = await api("GET", "/inventory");
  const sales = await api("GET", "/sales");
  const report = await api("GET", "/reports");
  return { inventory: inv.data, sales: sales.data, report: report.data };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function main() {
  await login();
  await seedSuppliers();
  await seedInitialDeliveries();
  await seedPrices();

  console.log(`\nSimulating ${SIM_DAYS} days of sales across ${STATIONS.length} stations x ${FUEL_TYPES.length} fuel types...`);
  for (let d = 0; d < SIM_DAYS; d++) {
    await simulateSalesDay(d);
  }
  console.log(`✔ Simulated ${expected.salesCount} sale transactions, ${expected.rejectedOversell} naturally rejected (insufficient stock)`);

  console.log("\nRunning deliberate oversell test...");
  const oversellHandledCorrectly = await forceOversellTest();

  console.log("\nFetching actual system state via API...");
  const actual = await fetchActual();

  
  const results = [];

 
  for (const [key, expectedQty] of Object.entries(expected.inventory)) {
    const [station, fuel] = key.split("|");
    const row = actual.inventory.find(
      (i) => i.station_name === station && i.fuel_type === fuel
    );
    const actualQty = row ? Number(row.quantity) : null;
    results.push({
      check: `Inventory: ${station} / ${fuel}`,
      expected: round2(expectedQty),
      actual: actualQty,
      pass: actualQty !== null && Math.abs(actualQty - expectedQty) < 0.01,
    });
  }

  
  results.push({
    check: "Total sales revenue (₦)",
    expected: round2(expected.totalRevenue),
    actual: round2(Number(actual.report.sales)),
    pass: Math.abs(round2(expected.totalRevenue) - round2(Number(actual.report.sales))) < 1,
  });

  
  results.push({
    check: "Total sales records",
    expected: expected.salesCount,
    actual: actual.sales.length,
    pass: expected.salesCount === actual.sales.length,
  });

 
  const bestFuelExpected = Object.entries(expected.fuelSold).sort((a, b) => b[1] - a[1])[0][0];
  results.push({
    check: "Best-selling fuel type",
    expected: bestFuelExpected,
    actual: actual.report.bestFuel ? actual.report.bestFuel.fuel_type : null,
    pass: actual.report.bestFuel && actual.report.bestFuel.fuel_type === bestFuelExpected,
  });


  const topStationExpected = Object.entries(expected.stationRevenue).sort((a, b) => b[1] - a[1])[0][0];
  results.push({
    check: "Top revenue-generating station",
    expected: topStationExpected,
    actual: actual.report.topStation ? actual.report.topStation.station_name : null,
    pass: actual.report.topStation && actual.report.topStation.station_name === topStationExpected,
  });


  results.push({
    check: "Oversell attempt correctly rejected",
    expected: true,
    actual: oversellHandledCorrectly,
    pass: oversellHandledCorrectly === true,
  });

 
  console.log("\n" + "=".repeat(90));
  console.log("VALIDATION RESULTS");
  console.log("=".repeat(90));
  let passCount = 0;
  for (const r of results) {
    if (r.pass) passCount++;
    console.log(
      `[${r.pass ? "PASS" : "FAIL"}] ${r.check.padEnd(35)} expected: ${String(r.expected).padEnd(20)} actual: ${r.actual}`
    );
  }
  console.log("=".repeat(90));
  console.log(`${passCount}/${results.length} checks passed`);

  require("fs").writeFileSync(
    "/home/claude/validation_results.json",
    JSON.stringify({ expected, actual, results, summary: `${passCount}/${results.length} passed` }, null, 2)
  );
  console.log("\nFull results written to validation_results.json");
}

main().catch((err) => {
  console.error("VALIDATION SCRIPT ERROR:", err);
  process.exit(1);
});
