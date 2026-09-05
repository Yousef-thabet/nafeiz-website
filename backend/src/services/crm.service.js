const axios = require('axios');

async function sendLeadToEspoCRM(contact) {
  if (!process.env.ESPOCRM_URL || !process.env.ESPOCRM_API_KEY) {
    return {
      ok: false,
      skipped: true,
      reason: 'EspoCRM configuration not configured',
    };
  }

  try {
    const nameParts = String(contact.name || '').trim().split(/\s+/);

    const firstName = nameParts.shift() || 'Unknown';
    const lastName = nameParts.join(' ') || 'Unknown';

    const payload = {
      firstName,
      lastName,
      emailAddress: contact.email || '',
      phoneNumber:
        contact.phone ||
        [contact.dialCode, contact.phoneNumber]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        '',
      description: contact.message || '',
    };

    if (contact.country) {
      payload.addressCountry = contact.country;
    }

    const response = await axios.post(
      `${process.env.ESPOCRM_URL}/api/v1/Lead`,
      payload,
      {
        headers: {
          'X-Api-Key': process.env.ESPOCRM_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return {
      ok: true,
      id: response.data?.id,
      data: response.data,
    };
  } catch (error) {
    console.error('EspoCRM ERROR STATUS:', error.response?.status);
    console.error('EspoCRM ERROR DATA:', error.response?.data);

    return {
      ok: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message,
    };
  }
}

module.exports = { sendLeadToEspoCRM };