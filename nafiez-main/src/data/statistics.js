export const statistics = [
  { id: 'countries', key: 'stat1', value: 0, suffix: '+' },
  { id: 'suppliers', key: 'stat2', value: 0, suffix: '+' },
  { id: 'orders', key: 'stat3', value: 0, suffix: '+' },
  { id: 'years', key: 'stat4', value: 0, suffix: '' },
];

export function getStatistics(settings = {}) {
  const values = {
    countries: Number.isFinite(Number(settings.statisticsCountries)) && settings.statisticsCountries !== '' ? Number(settings.statisticsCountries) : 0,
    suppliers: Number.isFinite(Number(settings.statisticsFactories)) && settings.statisticsFactories !== '' ? Number(settings.statisticsFactories) : 0,
    orders: Number.isFinite(Number(settings.statisticsShipments)) && settings.statisticsShipments !== '' ? Number(settings.statisticsShipments) : 0,
    years: Number.isFinite(Number(settings.statisticsYears)) && settings.statisticsYears !== '' ? Number(settings.statisticsYears) : 0,
  };

  return statistics.map((stat) => ({ ...stat, value: values[stat.id] ?? stat.value }));
}
