const axios = require('axios');

async function sendLeadToHubSpot(contact) {
  if (!process.env.HUBSPOT_API_KEY) {
    return { ok: false, skipped: true, reason: 'HubSpot API key not configured' };
  }

  try {
    const properties = {
      firstname: contact.name.split(' ')[0] || contact.name,
      lastname: contact.name.split(' ').slice(1).join(' ') || 'Unknown',
      email: contact.email,
      phone: contact.phone || [contact.dialCode, contact.phoneNumber].filter(Boolean).join(' ').trim() || '',
      country: contact.country || '',
      message: contact.message,
    };

    if (process.env.HUBSPOT_ENABLE_LEAD_QUALIFICATION === 'true') {
      properties.visited_china = typeof contact.visitedChina === 'boolean' ? String(contact.visitedChina) : '';
      properties.interests = Array.isArray(contact.interests) ? contact.interests.join(',') : '';
      properties.estimated_order_quantity = contact.estimatedOrderQuantity || '';
      properties.start_timeline = contact.startTimeline || '';
      properties.product_readiness = contact.productReadiness || '';
      properties.country_code = contact.countryCode || '';
      properties.dial_code = contact.dialCode || '';
    }

    await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      { properties },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

module.exports = { sendLeadToHubSpot };
