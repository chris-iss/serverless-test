const fetch = require("node-fetch");
require("dotenv").config();

let isExecuting = false;

const thinkificProductIdMap = {
    "2965465": "2965465",
    "2965473": "2965473",
    "2965479": "2965479",
    "2965489": "2965489",
    "2965499": "2965499",
    "2965518": "2965518",
    "2965523": "2965523",
    "2965534": "2965534",
    "2965538": "2965538",
    "2965541": "2965541",
    "2965546": "2965546",
    "2965548": "2965548",
    "2937008": "2937008",
    "2822347": "2822347"
};


const coursesMap = [
    "Certificate in Business Sustainability",
    "Certificate in Sustainability Plan Development",
    "Certificate in Sustainability Plan Implementation",
    "Certificate in Decarbonisation: Achieving Net Zero",
    "Certificate in Circular Economy",
    "Certificate in Business with Biodiversity",
    "Certificate in Diversity Equity and Inclusion",
    "Certificate in Sustainable Finance",
    "Certificate in Sustainable Business Operations",
    "Certificate in Sustainable Supply Chain",
    "Certificate in Green Marketing",
    "Certificate in ESG Reporting and Auditing",
    "Certificate in Corporate Sustainability Reporting Directive (CSRD)",
    "Diploma in Business Sustainability"
];

exports.handler = async (event) => {
    try {
        if (isExecuting) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: "Function is already executing" })
            };
        }

        isExecuting = true;

        const getNetlifyKey = event.queryStringParameters && event.queryStringParameters.API_KEY;
        const getValidationKey = process.env.Netlify_API_KEY;
        const extractParameters = JSON.parse(event.body);

        if (getNetlifyKey !== getValidationKey) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Unauthorized Access" })
            };
        }

        console.log("Request Body:", extractParameters);

        const { email, responseDataId, coursesSelected } = extractParameters;

        console.log("RECEIVED PRODUCT ID:", responseDataId);
        console.log("COURSE-SELECTED:", coursesSelected);

        const selectedCoursesData = coursesSelected.split(",");

        const contactPropertyToUpdate = thinkificProductIdMap[responseDataId];
        console.log("CHECKING PRD EXISST", contactPropertyToUpdate)
        if (!contactPropertyToUpdate) {
            console.log("Invalid product ID:", responseDataId);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: `Invalid product ID: ${responseDataId}` })
            };
        }

        // const hubspotSearchContact = async () => {
        //     const hubspotBaseURL = `https://api.hubapi.com/crm/v3/objects/contacts/search`;

        //     try {
        //         const hubspotSearchProperties = {
        //             filterGroups: [
        //                 { filters: [{ operator: "EQ", propertyName: "email", value: email }] },
        //                 { filters: [{ operator: "EQ", propertyName: "hs_additional_emails", value: email }] },
        //             ],
        //             limit: 100,
        //             properties: [
        //                 "id",
        //                 "email",
        //                 contactPropertyToUpdate
        //             ],
        //             sorts: [{ propertyName: "lastmodifieddate", direction: "ASCENDING" }],
        //         };

        //         const response = await fetch(hubspotBaseURL, {
        //             method: "POST",
        //             headers: {
        //                 "Authorization": `Bearer ${process.env.HUBSPOT_API_KEY}`,
        //                 "Content-Type": "application/json",
        //             },
        //             body: JSON.stringify(hubspotSearchProperties),
        //         });

        //         if (!response.ok) {
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }

        //         const searchContact = await response.json();

        //         if (!searchContact.results.length) {
        //             throw new Error("No contact found");
        //         }

        //         const extractHubspotUserId = searchContact.results[0].id;


        //         ////////////////////Update Unbudled Module Type//////////////////////////
        //         const updateCustomerCourse = async () => {
        //             try {
        //                 // Building the multi-line text for unbundled_module_type
        //                 const updateProperty = {
        //                     unbunled_bought_modules: selectedCoursesData.join("\n") // Join selected courses with newline
        //                 };

        //                 console.log("UPDATING unbundled_module_type TO:", updateProperty);

        //                 const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${extractHubspotUserId}`, {
        //                     method: "PATCH",
        //                     headers: {
        //                         Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        //                         "Content-Type": "application/json",
        //                     },
        //                     body: JSON.stringify({ properties: updateProperty })
        //                 });

        //                 if (!response.ok) {
        //                     throw new Error(`HTTP error! status: ${response.status}`);
        //                 }

        //                 const updateContact = await response.json();
        //                 console.log("Customer_Course Updated:", updateContact);

        //             } catch (error) {
        //                 console.log("Error updating Customer_Course:", error.message);
        //             }
        //         };

        //         // Update unbundled_module_type property with selected courses
        //         await updateCustomerCourse();


        //         //////////////////Update product id property with id////////////////////
        //         const updateCoursePrdId = async () => {
        //             try {
        //                 const unbundledProductIdProperty = {};
        //                 unbundledProductIdProperty[contactPropertyToUpdate] = `${responseDataId}`;

        //                 console.log("CHECKING PRODUCT ID'S:", unbundledProductIdProperty);

        //                 const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${extractHubspotUserId}`, {
        //                     method: "PATCH",
        //                     headers: {
        //                         Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        //                         "Content-Type": "application/json",
        //                     },
        //                     body: JSON.stringify({ properties: unbundledProductIdProperty })
        //                 });

        //                 if (!response.ok) {
        //                     throw new Error(`HTTP error! status: ${response.status}`);
        //                 }

        //                 const updateContact = await response.json();
        //                 console.log("Course Product Id Updated:", updateContact);

        //             } catch (error) {
        //                 console.log("Error updating module completion:", error.message);
        //             }
        //         };

        //         await updateCoursePrdId();

        //         const matchedCourses = [];

        //         for (let course of coursesMap) {
        //             console.log("CHECKING FOR COURSE IN LOOP:", course);
        //             if (selectedCoursesData.includes(course)) {
        //                 const enrolled = "Enrolled";
        //                 let updateContactProperty;
        //                 switch (course) {
        //                     case "Certificate in Business Sustainability":
        //                         updateContactProperty = "unbundled_module_1";
        //                         break;
        //                     case "Certificate in Sustainability Plan Development":
        //                         updateContactProperty = "unbundled_module_2";
        //                         break;
        //                     case "Certificate in Sustainability Plan Implementation":
        //                         updateContactProperty = "unbundled_module_3";
        //                         break;
        //                     case "Certificate in Decarbonisation: Achieving Net Zero":
        //                         updateContactProperty = "unbundled_module_4";
        //                         break;
        //                     case "Certificate in Circular Economy":
        //                         updateContactProperty = "unbundled_module_5";
        //                         break;
        //                     case "Certificate in Business with Biodiversity":
        //                         updateContactProperty = "unbundled_module_6";
        //                         break;
        //                     case "Certificate in Diversity Equity and Inclusion":
        //                         updateContactProperty = "unbundled_module_7";
        //                         break;
        //                     case "Certificate in Sustainable Finance":
        //                         updateContactProperty = "unbundled_module_8";
        //                         break;
        //                     case "Certificate in Sustainable Business Operations":
        //                         updateContactProperty = "unbundled_module_9";
        //                         break;
        //                     case "Certificate in Sustainable Supply Chain":
        //                         updateContactProperty = "unbundled_module_10";
        //                         break;
        //                     case "Certificate in Green Marketing":
        //                         updateContactProperty = "unbundled_module_11";
        //                         break;
        //                     case "Certificate in ESG Reporting and Auditing":
        //                         updateContactProperty = "unbundled_module_12";
        //                         break;
        //                     case "Certificate in Corporate Sustainability Reporting Directive (CSRD)":
        //                         updateContactProperty = "unbundled_csrd";
        //                         break;
        //                     case "Diploma in Business Sustainability":
        //                         updateContactProperty = "diploma_enrolment";
        //                         break;
        //                     default:
        //                         console.log("No contact Property defined for:", course);
        //                 }
        //                 if (updateContactProperty) {
        //                     matchedCourses.push({ course, updateContactProperty, status: enrolled });
        //                 }
        //             }
        //         }

        //         if (matchedCourses.length > 0) {
        //             await Promise.all(matchedCourses.map(async ({ course, updateContactProperty, status }) => {
        //                 try {
        //                     const updateContactPropertyObject = {};
        //                     updateContactPropertyObject[updateContactProperty] = status;

        //                     const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${extractHubspotUserId}`, {
        //                         method: "PATCH",
        //                         headers: {
        //                             Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        //                             "Content-Type": "application/json",
        //                         },
        //                         body: JSON.stringify({ properties: updateContactPropertyObject })
        //                     });

        //                     if (!response.ok) {
        //                         throw new Error(`HTTP error! status: ${response.status}`);
        //                     }

        //                     const updateCourseStatus = await response.json();
        //                     console.log(`Course: ${course}, Property: ${updateContactProperty}, Status: ${status} - Updated Successfully:`, updateCourseStatus);
        //                 } catch (error) {
        //                     console.log(`Error updating ${course} status:`, error.message);
        //                 }
        //             }));
        //         } else {
        //             console.log("No courses matched the update criteria.");
        //         }
        //     } catch (error) {
        //         console.log("HUBSPOT SEARCH ERROR", error.message);
        //     }
        // };

        // await hubspotSearchContact();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message })
        };
    } finally {
        isExecuting = false;
    }
};
