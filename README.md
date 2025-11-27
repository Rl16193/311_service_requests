# Predicting 311 Requests For Environment and Transport Divisions

## Project Overview

Toronto’s 311 system receives hundreds of thousands of service requests every year, spanning road maintenance, park and forestry operations, waster management and other municipal services. These requests provide a valuable signal of infrastructure needs and community concerns. However, the city’s open 311 requests data contains significant gaps and inconsistencies that make it difficult to assess trends, understand workload patterns or support proactive service planning.

Only an estimated 30–35% of the total 311 requests are represented in the open dataset, and critical fields like request closure dates are missing, making it difficult to analyze response time and service efficiency. In addition, the city has undergone major structural changes, including the consolidation of wards from 47 to 25. Many service request categories have been renamed, merged, split or discontinued due to low reporting volume. Together, these issues restrict long-term trend analysis and make it challenging to compare wards equitably. 

This project addresses these gaps by cleaning, harmonizing and modelling the 311 dataset in combination with open climate data and green-space information. The updated ward mappings and standardization of service request values enable the Machine Learning model to learn long-term patterns in the city’s reporting behaviour, as some cleaned request types contribute to 40% of total requests for that division. Spatial features such as ward density, land area, and green-space characteristics further support ward-level forecasting. Most winter maintenance requests follow the winter/snow seasonal cycle; road damage requests follow freeze-thaw weather cycles; environment requests are higher in the hotter months. This can enable divisions to plan staffing, materials, and equipment use based on predictable weather cycles.

Ward-level forecasts support more equitable and risk-based service delivery, allowing the city to distribute resources fairly, prioritize high-impact issues, and account for wards that serve larger populations or experience higher discomfort or safety impacts. Preliminary models show strong accuracy for divisions with clear seasonal or spatial drivers (e.g., Climate and Forestry). Further improvements are planned for more complex divisions, such as Transportation—for example, grouping requests into weather-linked categories (winter, road damage), operational issues (parking, signage), and public-space concerns (graffiti, litter).

Ultimately, this project creates an early-warning and planning system that improves Toronto’s service responsiveness, strengthens resource efficiency, and enhances long-term infrastructure and maintenance planning.

## Datasets Used

- Daily Weather Toronto (2013-2025); https://toronto.weatherstats.ca/download.html
- Ward Profiles (25 Ward Model); https://open.toronto.ca/dataset/ward-profiles-25-ward-model/
- Physical Location of Trees; https://open.toronto.ca/dataset/topographic-mapping-physical-location-of-trees/
- Green Spaces; https://open.toronto.ca/dataset/green-spaces/
- 311 Service Requests Customer Initiated (2014-2025); https://open.toronto.ca/dataset/311-service-requests-customer-initiated/
  
## Potential Impact

- Although still in the prototype stage, the project has already demonstrated clear potential impact, such as:

- The one-month look-ahead models provide accurate forecasts, with more than 90% of the variance explained for the Forestry Operations section of Environment Requests. Forestry Operation sections contribute to 85% of total environmental requests. This demonstrates the model’s ability to learn highly seasonal and climate-dependent patterns. With additional tuning, the approach can be extended to other service areas such as Transportation, Waste Management, Animal Services, and Water.

<img width="1478" height="748" alt="image" src="https://github.com/user-attachments/assets/c0596a79-73d9-4a65-a6cd-5744dc56d699" />
          Environment requests

<img width="1458" height="682" alt="image" src="https://github.com/user-attachments/assets/5470fccf-f72d-428b-85b3-4fdbf7acd468" />

- Even a moderate forecasting accuracy can reduce overtime costs by 5-10%. Earlier identification of high-demand periods allows supervisors to plan staffing, equipment, and contractor needs more strategically, reducing backlogs during weather-driven surges.

- This project establishes the groundwork for cleaning/harmonizing service request names and wards, which can be adapted by city analysts for other datasets. 

- Anticipating these requests can allow city officials to monitor locations with higher frequency and remove hazardous tree limbs sooner, snow and ice maintenance can be deployed proactively, and road/ sidewalk damage can be identified, and plans for road repair can begin early (this can in turn reduce the number of collisions and fatal injuries)

  <img width="1690" height="836" alt="image" src="https://github.com/user-attachments/assets/ad3f974d-c58d-4b77-805f-7cbc7f08771e" />


- The model can also be used to predict yearly or quarterly requests, which can allow city divisions to plan their yearly budgets and incorporate predicted maintenance workloads, material consumption needs and justify staffing levels using data-driven evidence.
