const fs = require('fs');
const globby = require('globby');
const countryData = require('../src/data/country-data.json');
const propertyData = require('../src/data/property-data.json');

async function generateSiteMap() {
  let pages = await globby([
    'src/pages/**/*.js',
    '!src/pages/_*.js',
    '!src/pages/property/*.js',
    '!src/pages/**/[country_slug].js',
    '!src/pages/**/[project_slug].js',
    '!src/pages/auth/',
    '!src/pages/dashboard/',
    '!src/pages/create-account.js',
    '!src/pages/forgot-password.js',
    '!src/pages/login.js',
    '!src/pages/logout.js',
    '!src/pages/signup.js',
    '!src/pages/get-started.js',
  ]);
  if (countryData && countryData.length > 0) {
    countryData.map((country) => {
      pages.push(country.slug);
    });
  }
  if (propertyData && propertyData.length > 0) {
    propertyData.map((property) => {
      pages.push(`project/${property.slug}`);
    });
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<sitemap>
		${pages
      .map((page) => {
        const path = page
          .replace('src/pages/', '')
          .replace('index', '')
          .replace('.js', '')
          .replace('.md', '');
        const route = path === '/index' ? '' : path;
        return `
					 <loc>${`https://app.chaaat.io/${route}`}</loc>
				  `;
      })
      .join('')}
	</sitemap>
</sitemapindex>
  `;

  fs.writeFileSync('public/sitemap.xml', sitemap);
}

generateSiteMap();
