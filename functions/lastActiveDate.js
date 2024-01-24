const fetch = require("node-fetch");
require("dotenv").config();

exports.handler = async (event, context) => {
  const getNetlifyKey = event.queryStringParameters.API_KEY;
  const validationKey = process.env.Netlify_API_KEY;

  if (getNetlifyKey === validationKey) {
    const hubspotBaseURL = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
    const extractParameteres = JSON.parse(event.body);

    const extractThinkificEmail = extractParameteres.payload.user.email;
    const extractCourseName = extractParameteres.payload.course.name;
    const lastActivityDate = new Date(extractParameteres.created_at);
    const formattedLastActiveDate = lastActivityDate
      .toISOString()
      .split("T")[0];

    const hubspotSearchContact = async () => {
      try {
        const hubspotSearchProperties = {
          after: "0",
          filterGroups: [
            {
              filters: [
                {
                  operator: "EQ",
                  propertyName: "email",
                  value: extractThinkificEmail,
                },
              ],
            },
            {
              filters: [
                {
                  operator: "EQ",
                  propertyName: "hs_additional_emails",
                  value: extractThinkificEmail,
                },
              ],
            },
          ],
          limit: "100",
          properties: ["email", "thinkific_diploma_last_activity_date", "id"], // Include id for updating
          sorts: [{ propertyName: "lastmodifieddate", direction: "ASCENDING" }],
        };

        const searchContact = await fetch(hubspotBaseURL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hubspotSearchProperties),
        });

        // Response from hubspot contact search by email
        const hubspotContactResponse = await searchContact.json();

        const extractHubspotUserId =
          hubspotContactResponse.results[0].properties.hs_object_id;

        await updateThinkificLastActivityDateProperty(
          extractHubspotUserId,
          formattedLastActiveDate
        );
      } catch (error) {
        console.log("HUBSPOT SEARCH ERROR", error.message);
      }
    };

    hubspotSearchContact();

    const updateThinkificLastActivityDateProperty = async (
      contactId,
      lastActivityDate
    ) => {
      let lastActivity_DateProperty;

      if (extractCourseName === "Diploma in Business Sustainability 2024") {
        lastActivity_DateProperty = {
          properties: {
            thinkific_diploma_last_activity_date: lastActivityDate,
          },
        };
      } else if (
        extractCourseName === "Certificate in Business Sustainability 2024"
      ) {
        lastActivity_DateProperty = {
          properties: {
            thinkific_diploma_last_activity_date: lastActivityDate,
          },
        };
      }

      const updateContact = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lastActivity_DateProperty),
        }
      );

      const response = await updateContact.json();

      console.log("HUBSPOT LAST_ACTIVE RESPOPNSE", response);
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success",
      }),
    };
  } else {
    return {
        statusCode: 401,
        body: JSON.stringify({
            message: "UNAUTHORIZED ACCESS"
        })
    }
  }
};
