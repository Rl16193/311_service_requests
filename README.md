# Predicting 311 Requests

## Project Overview

Toronto’s 311 system receives hundreds of thousands of service requests every year, spanning road maintenance, park and forestry operations, waster management and other municipal services. These requests provide a valuable signal of infrastructure needs and community concerns. However, the city’s open 311 requests data contains significant gaps and inconsistencies that make it difficult to assess trends, understand workload patterns or support proactive service planning.

Only an estimated 30–35% of total 311 requests are represented in the open dataset, and critical fields like request closure dates are missing, making it difficult to analyze response time and service efficiency. In addition, the city has undergone major structural changes, including the consolidation of wards from 47 to 25 and multiple renamings or retirements of service request categories. Many service request categories have been renamed, merged, split or discontinued due to low reporting volume. Together these issues restrict long-term trend analysis and make it challenging to compare wards equitably. 

This project addresses these gaps by cleaning, harmonizing and modeling the 311 dataset in combination with open climate data and green-space information. The updated wards mappings and standardization of service request values enable the Machine Learning model to learn long-term patterns in city’s reporting behaviour; important as some cleaned request types contribute to 40% of total requests for that division. Spatial features such as ward density, land area, and green-space characteristics further support ward-level forecasting.
I have dashboards presenting insights into seasonal patterns of requests, most winter maintenance requests follow the winter/snow seasonal cycle; road damage requests follow freeze-thaw weather cycles; environment requests are higher in the hotter months.This can enables divisions to plan staffing, materials, and equipment use based on predictable weather cycles.

Ward-level forecasts support more equitable and risk-based service delivery, allowing the city to distribute resources fairly, prioritize high-impact issues, and account for wards that serve larger populations or experience higher discomfort or safety impacts.
Preliminary models show strong accuracy for divisions with clear seasonal or spatial drivers (e.g., Climate and Forestry). Further improvements are planned for more complex divisions such as Transportation—for example, grouping requests into weather-linked categories (winter, road damage), operational issues (parking, signage), and public-space concerns (graffiti, litter).

Ultimately, this project creates an early-warning and planning system that improves Toronto’s service responsiveness, strengthens resource efficiency, and enhances long-term infrastructure and maintenance planning.

## Potential Impact

- Although still in the prototype stage, the project has already demonstrated clear potential impact, such as:

- The one-week and one-month look ahead models provide accurate forecasts, with more than 90% of the variance explained for Forestry Operations section of Environment Requests. Forestry Operation sections contribute to 85% of total environment requests. This demonstrates the model’s ability to learn highly seasonal and climate-dependent patterns. With additional tuning, the approach can be extended to other service areas such as Transportation, Waster Management, Animal Services, and Water.

- Even a moderate forecasting accuracy can reduce overtime costs by 5-10%. Earlier identification of high-demand periods , allows supervisors to plan staffing, equipment, and contractor needs more strategically, reducing backlogs during weather-driven surges.

- This project establishes the ground work for cleaning/harmonizing service request names and wards, which can be adapted by city analysts for other datasets. 

- Anticipating these requests can allow city officials to monitor locations with higher frequency and remove hazardous tree limbs sooner, snow and ice maintenance can be deployed proactively and road/ sidewalk damage can be identified and plans for road repair can begin early (this can also in turn reduce the number of collisions and fatal injuries)

- The model can also be used to predict yearly or quarterly requests, which can allow city divisions to plan their yearly budgets and incorporate predicted maintenance workloads, material consumption needs and justify staffing levels using data-driven evidence.
