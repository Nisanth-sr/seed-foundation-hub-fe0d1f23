export const SITE = {
  name: "SEED Foundation",
  tagline: "Every community deserves the opportunity to thrive.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://seedfound.org",
  email: "contact@seedfound.org",
  phone: "[Phone to be provided]",
  hours: "[Hours to be provided]",
  compliance: {
    trustReg: "R/Idalagudi/Book-4/23/2018",
    darpan: "TN/2026/1130617",
  },
} as const;

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/our-stories", label: "Our Stories" },
  { href: "/get-involved", label: "Get Involved" },
] as const;

export const HERO = {
  headline: "Every community deserves the opportunity to thrive.",
  subheading:
    "SEED FOUNDATION works alongside communities to improve health awareness, expand educational opportunities, protect the environment, and respond to humanitarian needs. Through community-led programs, awareness initiatives, and collaborative action, we help people gain knowledge, build confidence, and create positive change where it matters most.",
  cta: { label: "Explore Our Stories", href: "/our-stories" },
} as const;

export const BELIEF = {
  quote: "We believe lasting change begins with informed communities.",
  highlight: "informed communities",
  body: "Whether helping students make better career decisions, encouraging early health awareness, promoting environmental responsibility, or supporting families during times of crisis, our work is built on the belief that knowledge, participation, and compassion create stronger communities.",
  cta: { label: "Learn more about our role", href: "/about" },
} as const;

export type FocusArea = "health" | "education" | "environment" | "disaster-relief";

export const PILLARS: {
  id: FocusArea;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    id: "health",
    title: "Health Awareness",
    description:
      "We conduct community awareness initiatives that encourage prevention, early intervention, and informed decision-making. Our programs help communities understand important health issues while creating safe spaces for discussion and learning. This is reflected in initiatives such as the Cancer Awareness Program and the \"Missing Numbers\" suicide awareness initiative.",
    href: "/our-stories?area=health",
  },
  {
    id: "education",
    title: "Education & Career Guidance",
    description:
      "Students deserve access to information that helps them shape their future. Our career guidance programs introduce educational pathways, career opportunities, and practical guidance so young people can make informed decisions with greater confidence.",
    href: "/our-stories?area=education",
  },
  {
    id: "environment",
    title: "Environment",
    description:
      "Healthy communities depend on a healthy environment. Through awareness campaigns, waste segregation initiatives, and community cleanup efforts, we encourage responsible environmental practices that protect coastal ecosystems and marine life.",
    href: "/our-stories?area=environment",
  },
  {
    id: "disaster-relief",
    title: "Humanitarian Relief",
    description:
      "When communities face emergencies, collective action matters. We mobilize volunteers, educational institutions, and community members to provide practical support that reaches people when they need it most.",
    href: "/our-stories?area=disaster-relief",
  },
];

export const PROGRAMS: {
  slug: string;
  title: string;
  focusArea: FocusArea;
  focusLabel: string;
  status: "active" | "completed";
  summary: string;
  description: string;
  storySlug?: string;
}[] = [
  {
    slug: "you-can-cancer-awareness",
    title: "You Can – Cancer Awareness Program",
    focusArea: "health",
    focusLabel: "Health",
    status: "completed",
    summary:
      "Community education on cancer prevention, early detection, and timely medical consultation in Kadiapattanam Village.",
    description:
      "The \"You Can\" Cancer Awareness Program brought together residents of Kadiapattanam Village to learn about cancer prevention, early detection, and the importance of timely medical consultation. Through educational sessions and open discussions, participants gained practical knowledge while myths surrounding cancer were addressed through direct interaction.",
    storySlug: "helping-communities-understand-cancer",
  },
  {
    slug: "missing-numbers",
    title: "Missing Numbers – Suicide Awareness Initiative",
    focusArea: "health",
    focusLabel: "Health",
    status: "completed",
    summary:
      "Storytelling through film to encourage open conversations about mental health among students.",
    description:
      "\"Missing Numbers\" used storytelling through film to encourage students to discuss mental health openly. The initiative aimed to reduce stigma, promote early help-seeking, and remind young people that support is available.",
    storySlug: "encouraging-conversations-around-mental-health",
  },
  {
    slug: "puthoor-career-guidance",
    title: "Career Guidance – Puthoor Village",
    focusArea: "education",
    focusLabel: "Education",
    status: "completed",
    summary:
      "Interactive sessions helping students explore educational pathways and career options.",
    description:
      "Students from Puthoor Village participated in career guidance sessions that explored educational pathways, career options, and practical planning. Interactive discussions helped participants better understand opportunities aligned with their interests and aspirations.",
    storySlug: "guiding-students-towards-their-future",
  },
  {
    slug: "colachel-coastal-conservation",
    title: "Colachel Harbour Coastal Conservation",
    focusArea: "environment",
    focusLabel: "Environment",
    status: "completed",
    summary:
      "Awareness, waste segregation infrastructure, and community cleanup to protect marine life.",
    description:
      "At Colachel Harbour, awareness campaigns, waste segregation bins, and a community cleanup effort encouraged residents to take an active role in protecting marine life and reducing coastal pollution.",
    storySlug: "protecting-our-coastline",
  },
  {
    slug: "kerala-flood-relief-2018",
    title: "Kerala Flood Relief – Rice Donation Drive",
    focusArea: "disaster-relief",
    focusLabel: "Disaster Relief",
    status: "completed",
    summary:
      "Community-led food support for flood-affected families with St. John's College partners.",
    description:
      "Following the 2018 Kerala floods, SEED FOUNDATION partnered with St. John's College of Arts and Science to organize a rice donation drive that mobilized students, staff, and faculty to support flood-affected families with essential food supplies.",
    storySlug: "supporting-families-during-crisis",
  },
];

export const STORIES: {
  slug: string;
  title: string;
  category: string;
  focusArea: FocusArea;
  excerpt: string;
  body: string;
  image?: string;
}[] = [
  {
    slug: "helping-communities-understand-cancer",
    title: "Helping Communities Understand Cancer",
    category: "Health",
    focusArea: "health",
    excerpt:
      "The \"You Can\" Cancer Awareness Program brought practical knowledge on prevention and early detection to Kadiapattanam Village.",
    body: `PROJECT REPORT
"You Can" - A Cancer Awareness Program
An Initiative by SEED FOUNDATION
In Association with the Local Parish Community, Kadiapattanam

Program Title: You Can - Cancer Awareness Program
Date: 12th August 2018
Venue: Kadiapattanam Village, Kanyakumari District, Tamil Nadu
Organized by: SEED FOUNDATION & Fr. BABIYANS S.
Target Group: Residents of Kadiapattanam Village
Report Prepared on: 15th August 2018

1. Introduction
Cancer remains one of the leading causes of preventable death worldwide, and awareness at the grassroots level continues to be one of the most powerful tools in the fight against it. Early detection, timely medical consultation, and the dispelling of myths surrounding the disease can significantly improve outcomes for patients and reduce the overall burden on families and communities.

In line with its mission of promoting community health and wellbeing, SEED FOUNDATION organized the "You Can" Cancer Awareness Program on 12th August 2018 at Kadiapattanam Village, Kanyakumari District. The program was designed to educate villagers about the causes, symptoms, prevention, and early detection of cancer, and to encourage a proactive approach towards personal and family health.

2. Objectives of the Program
- To create awareness among village residents about the risk factors and early warning signs of cancer.
- To dispel common myths and misconceptions associated with cancer and its treatment.
- To encourage regular health check-ups and early medical consultation.
- To provide a platform for villagers to interact directly with the organizing team and clarify their doubts through an open question-and-answer session.
- To promote a culture of preventive healthcare within the local community.

3. Organizing Details
Organized By: SEED FOUNDATION & Fr. BABIYANS S.
Program Name: You Can - Cancer Awareness Program
Date: 12th August 2018
Venue: Kadiapattanam Village, Kanyakumari District
Participants: Residents of Kadiapattanam Village
Mode of Conduct: On-site, in-person community gathering

The event was conducted by the SEED FOUNDATION team, who took the lead in planning, coordinating, and delivering the awareness session. The program was held in a community hall setting that comfortably accommodated the attending villagers, allowing for an interactive and welcoming atmosphere throughout the session.

4. Participants
The program witnessed active participation from the residents of Kadiapattanam village, with attendees representing a cross-section of the local community, including women and elders. The turnout reflected a strong sense of interest and concern within the community regarding health and cancer-related issues, and participants remained engaged throughout the duration of the program.

5. Activities Conducted
5.1 Awareness Talk
The SEED FOUNDATION team conducted an informative talk covering the fundamentals of cancer, including common types, risk factors, lifestyle-related causes, and the importance of early detection. The session was delivered in a simple, relatable manner to ensure that the information was accessible and easy to understand for all age groups present.

5.2 Question & Answer Session
Following the awareness talk, an open Question & Answer session was held, giving villagers the opportunity to directly interact with the SEED FOUNDATION team. Participants asked questions related to symptoms, precautionary measures, and general health concerns, and the team provided clear, informative responses. This interactive segment played a key role in clearing doubts and reinforcing the key messages of the program.

6. Outcomes and Achievements
- Villagers gained a significantly improved understanding of cancer, its risk factors, and the importance of early detection.
- Common myths and misconceptions surrounding cancer were addressed and clarified through open discussion.
- The interactive Q&A session helped build trust between the community and the SEED FOUNDATION team, encouraging villagers to be more open about discussing health concerns.
- Positive feedback was received from the participants, who expressed appreciation for the awareness created and the clarity provided during the session.
- The program strengthened community engagement and laid the groundwork for future health awareness initiatives in the region.

7. Event Photographs
A glimpse of the awareness talk and interactive session conducted at Kadiapattanam village.

8. Event Poster
The official poster designed and circulated for the "You Can" Cancer Awareness Program.

9. Feedback
The response from the villagers of Kadiapattanam was encouraging and positive. Attendees appreciated the simplicity and clarity with which complex health information was communicated, and many expressed that the program had helped them understand cancer-related risks better than before. The open Question & Answer format was particularly well received, as it allowed participants to voice their personal concerns and receive direct guidance from the SEED FOUNDATION team. Several attendees also conveyed interest in participating in similar awareness programs in the future.

10. Conclusion
The "You Can" Cancer Awareness Program conducted at Kadiapattanam village on 12th August 2018 successfully achieved its objective of educating the local community about cancer awareness and prevention. Through an informative talk and an engaging Question & Answer session, the SEED FOUNDATION team was able to leave a lasting impact on the villagers, empowering them with knowledge that can contribute to earlier detection and better health outcomes.

The success of this initiative reaffirms the importance of grassroots-level health awareness programs and highlights the value of direct community engagement. SEED FOUNDATION remains committed to continuing such outreach efforts and extending the reach of health awareness to more villages and communities in the region.

11. Acknowledgement
SEED FOUNDATION extends its sincere gratitude to the residents of Kadiapattanam village for their warm participation and enthusiasm, and to the local community and venue hosts for their support in making this program a success. Special thanks to all team members who dedicated their time and effort towards planning, organizing, and conducting this awareness program.`,
    image: "/images/stories/helping-communities-understand-cancer.png",
  },
  {
    slug: "encouraging-conversations-around-mental-health",
    title: "Encouraging Conversations Around Mental Health",
    category: "Health",
    focusArea: "health",
    excerpt:
      "\"Missing Numbers\" used storytelling through film to help students discuss mental health openly.",
    body: `PROJECT REPORT
"Missing Numbers" - A Suicide Awareness Video
An Initiative by SEED FOUNDATION & Fr. SAM MATHEW
Reaching Out, Before It's Too Late

Program Title: "Missing Numbers" - Suicide Awareness Video
Date of Release: 18th July 2018
Venue: St. John's College of Arts and Science, Ammandivilai
Organized by: SEED FOUNDATION & Fr. SAM MATHEW
Target Group: College and School Students
Report Prepared on: 21st July 2018

1. Introduction
Mental health challenges among young people, including feelings of isolation and hopelessness, are a growing concern in student communities. Many students who are struggling remain silent due to stigma, fear of judgment, or simply not knowing how to reach out for help. Creative, relatable media can play a powerful role in opening up this conversation and encouraging students to seek support before a crisis develops.

With this understanding, SEED FOUNDATION, in association with Fr. SAM MATHEW, produced a short awareness video titled "Missing Numbers", focused on suicide awareness and prevention among college and school students. The video was released and screened at St. John's College of Arts and Science, Ammandivilai, on 18th July 2018, as part of an effort to encourage open conversation about mental health, help students recognize warning signs in themselves and their peers, and remind them that support is always available.

2. Objectives of the Program
- To raise awareness among college and school students about mental health struggles and the importance of seeking help early.
- To use narrative film as a relatable medium to communicate a sensitive subject in a way that resonates with young audiences.
- To reduce the stigma surrounding conversations about mental health and suicide among students.
- To encourage students to stay connected with friends, family, and support systems, and to reach out when struggling.
- To equip students and educators with a shared reference point for starting conversations about mental wellbeing on campus.

3. Organizing Details
Organized By: SEED FOUNDATION & Fr. SAM MATHEW
Program Name: "Missing Numbers" - Suicide Awareness Video
Date of Release: 18th July 2018
Venue: St. John's College of Arts and Science, Ammandivilai
Participants: College and school students
Mode of Conduct: Video production followed by an on-campus screening and program

The initiative was jointly organized by the SEED FOUNDATION team and Fr. SAM MATHEW, who oversaw the production of the awareness video from scripting and recording through to its final release. The video was screened as part of a formal program held at St. John's College of Arts and Science, Ammandivilai, where it was presented to an audience of students and faculty.

4. Participants
The program engaged college and school students as its primary audience, along with faculty members and guests present at St. John's College of Arts and Science during the screening. As the intended viewers of the awareness video, their presence and engagement were central to the success of this initiative in reaching young people directly with its message.

5. Activities Conducted
5.1 Production of the Awareness Video
The SEED FOUNDATION team conducted script narration, voice recording, and audio mixing sessions in a professional studio to produce "Missing Numbers", a short film centered on the theme of suicide awareness. The production process involved careful attention to presenting the subject with sensitivity, aiming to inform and support rather than alarm its young audience.

5.2 Screening and Program at the College
The completed video was formally released and screened at St. John's College of Arts and Science, Ammandivilai, on 18th July 2018. The screening was accompanied by a brief program, including opening remarks and a felicitation segment honoring individuals who contributed to the initiative, providing an opportunity for students and faculty to engage with the message of the film in a structured setting.

6. Outcomes and Achievements
- The awareness video "Missing Numbers" was successfully produced and released to a student audience at St. John's College of Arts and Science.
- Students were introduced to an important but often avoided topic through a relatable and thoughtfully produced short film.
- The screening created an opportunity for open dialogue about mental health and suicide awareness within the college community.
- The initiative contributed to reducing stigma and encouraging students to view seeking help as a sign of strength rather than weakness.
- The program strengthened SEED FOUNDATION's ongoing engagement with educational institutions on student mental health and wellbeing.

7. Event Photographs
A glimpse of the production process and the screening program at St. John's College of Arts and Science.

8. Event Poster
The official poster released for the "Missing Numbers" awareness video.

9. Feedback
The response from students and faculty at St. John's College of Arts and Science was thoughtful and appreciative. Many viewers noted that the film addressed a subject rarely discussed openly on campus, and that its sensitive, narrative approach made the message easier to absorb and reflect upon. Faculty members present at the screening expressed support for continuing such initiatives as part of student wellbeing efforts, and several students shared that the program encouraged them to think more seriously about checking in on their peers.

10. Conclusion
The "Missing Numbers" suicide awareness video initiative, released at St. John's College of Arts and Science, Ammandivilai, on 18th July 2018, successfully brought a critical but often overlooked issue into open conversation among students. Through thoughtful production and a well-organized screening program, SEED FOUNDATION and Fr. SAM MATHEW were able to reach young audiences with a message of hope, connection, and the importance of seeking help.

This initiative reflects SEED FOUNDATION's continued commitment to student mental health and wellbeing, and reaffirms the value of creative media as a tool for awareness and prevention. SEED FOUNDATION looks forward to extending this initiative to more educational institutions in the future.

11. Acknowledgement
SEED FOUNDATION extends its sincere gratitude to Fr. SAM MATHEW for his valuable support and collaboration in producing and releasing this initiative, and to the management, faculty, and students of St. John's College of Arts and Science, Ammandivilai, for hosting the screening and program. Special thanks to all team members and contributors who dedicated their time and effort towards the production of "Missing Numbers".`,
    image: "/images/stories/encouraging-conversations-around-mental-health.png",
  },
  {
    slug: "protecting-our-coastline",
    title: "Protecting Our Coastline",
    category: "Environment",
    focusArea: "environment",
    excerpt:
      "At Colachel Harbour, awareness, waste segregation, and cleanup efforts put residents at the center of coastal care.",
    body: `PROJECT REPORT
Coastal Cleanliness & Waste Segregation Awareness Program
An Initiative by SEED FOUNDATION
Protecting Our Shores, Preserving Marine Life

Program Title: Coastal Cleanliness & Waste Segregation Awareness Program
Date: 22nd March 2018
Venue: Colachel (Kulachal) Harbour, Kanyakumari District
Organized by: SEED FOUNDATION
Target Group: Local Fishing Community & Coastal Residents
Report Prepared on: 25th March 2018

1. Introduction
Marine pollution caused by plastic and other non-biodegradable waste poses a severe threat to ocean ecosystems, endangering marine life such as turtles, birds, and other coastal species. Harbours and beaches, being high-traffic zones for fishing and public activity, are especially vulnerable to the accumulation of waste that eventually finds its way into the sea.

With the goal of protecting marine life and promoting a cleaner coastline, SEED FOUNDATION organized a Coastal Cleanliness & Waste Segregation Awareness Program on 22nd March 2018 at Colachel (Kulachal) Harbour, Kanyakumari District. The program combined an awareness campaign, installation of waste segregation bins, and a hands-on beach cleanup drive to encourage responsible waste disposal among the local community.

2. Objectives of the Program
- To create awareness among fishermen, local residents, and visitors about the harmful effects of ocean waste on marine life.
- To encourage the practice of segregating waste into biodegradable and non-biodegradable categories at the source.
- To install dedicated waste segregation bins at the harbour to enable proper and convenient disposal of waste.
- To carry out a beach cleanup drive and set an example of active community participation in coastal conservation.
- To promote a long-term sense of environmental responsibility and duty toward protecting the ocean among the local community.

3. Organizing Details
Organized By: SEED FOUNDATION
Program Name: Coastal Cleanliness & Waste Segregation Awareness Program
Date: 22nd March 2018
Venue: Colachel (Kulachal) Harbour, Kanyakumari District
Participants: Local fishing community and coastal residents
Mode of Conduct: On-site outdoor campaign at the harbour and adjoining beach

The program was conducted by the SEED FOUNDATION team, who planned and carried out the complete initiative from designing the awareness banner to installing the waste segregation bins and leading the cleanup drive at the harbour.

4. Participants
The program engaged the local fishing community and residents of the Colachel (Kulachal) coastal area, who form the primary stakeholders affected by, and responsible for, the cleanliness of the harbour and its surrounding beach. Their direct involvement was key to ensuring that the awareness message and the newly installed infrastructure would be respected and put to consistent use going forward.

5. Activities Conducted
5.1 Awareness Campaign
An awareness banner was designed and displayed at the harbour, featuring striking imagery of marine animals affected by ocean plastic, along with a message in Tamil urging the community to keep the coast clean and protect marine life. The banner emphasized that careless disposal of waste in the sea ultimately harms future generations and called on people of all backgrounds to unite in protecting the ocean and its creatures.

5.2 Installation of Waste Segregation Bins
Two dedicated concrete waste bins were installed at the harbour - one for non-biodegradable waste (marked in red) and one for biodegradable waste (marked in green). This simple yet effective infrastructure was set up to make responsible waste segregation accessible and convenient for fishermen and visitors using the harbour on a daily basis.

5.3 Beach Cleanup Drive
The SEED FOUNDATION team carried out a hands-on beach cleanup drive along the shoreline adjacent to the harbour, collecting scattered plastic waste and debris. The cleanup activity served as a practical demonstration of the awareness message and encouraged onlookers to take part in keeping the coastline litter-free.

6. Outcomes and Achievements
- A visible, physical waste segregation system was successfully established at Colachel Harbour for the first time, encouraging sustainable waste disposal habits.
- The local fishing community and residents gained increased awareness about the impact of ocean waste on marine life and ecosystems.
- The beach cleanup drive resulted in the removal of a significant quantity of plastic and other waste from the shoreline.
- The initiative fostered a greater sense of environmental responsibility and collective duty among the coastal community.
- The program set a strong precedent for future environmental and cleanliness drives to be undertaken at other coastal locations.

7. Event Photographs
A glimpse of the bin installation work and the SEED FOUNDATION team at Colachel Harbour.

8. Event Poster
The official awareness banner displayed at Colachel Harbour as part of this program.

9. Feedback
The response from the fishing community and residents of Colachel was positive and encouraging. Many appreciated the installation of the dedicated waste bins, noting that having a clear, convenient place to dispose of waste made responsible disposal far more practical. The visual message conveyed through the awareness banner also resonated strongly with the community, prompting several onlookers to join the cleanup effort spontaneously.

10. Conclusion
The Coastal Cleanliness & Waste Segregation Awareness Program conducted at Colachel (Kulachal) Harbour on 22nd March 2018 successfully combined awareness, infrastructure, and direct action to address the pressing issue of coastal and marine pollution. Through the awareness banner, the installation of segregation bins, and the beach cleanup drive, SEED FOUNDATION was able to create a tangible and lasting impact on the local community's approach to waste management.

This initiative reaffirms the importance of grassroots environmental action and the role that accessible infrastructure plays in sustaining behavioral change. SEED FOUNDATION remains committed to extending similar coastal cleanliness initiatives to other harbours and beaches in the region.

11. Acknowledgement
SEED FOUNDATION extends its sincere gratitude to the fishing community and residents of Colachel for their cooperation and participation, and to the local harbour authorities for their support in facilitating the installation of the waste segregation bins. Special thanks to all team members who dedicated their time and effort towards planning, organizing, and conducting this coastal cleanliness initiative.`,
    image: "/images/stories/protecting-our-coastline.png",
  },
  {
    slug: "supporting-families-during-crisis",
    title: "Supporting Families During Crisis",
    category: "Disaster Relief",
    focusArea: "disaster-relief",
    excerpt:
      "After the 2018 Kerala floods, a rice donation drive mobilized students and faculty to support affected families.",
    body: `PROJECT REPORT
2018 Kerala Floods Relief - Rice Donation Drive
An Initiative by SEED FOUNDATION & St. John's College of Arts and Science
Solidarity in Crisis, Hope in Action

Program Title: 2018 Kerala Floods Relief - Rice Donation Drive
Date of Program: 21st August 2018
Venue: St. John's College of Arts and Science, Ammandivilai
Organized by: SEED FOUNDATION & St. John's College of Arts and Science
Target Group: SEED FOUNDATION Team, St. John's College Students, Management, & Community
Report Prepared on: 23rd August 2018

1. Introduction
In August 2018, the state of Kerala faced one of its worst natural disasters in nearly a century. Unprecedented rainfall and flooding devastated communities, displaced thousands of families, and created an acute humanitarian crisis. The disaster affected not only lives and livelihoods but also disrupted food supplies and basic necessities across the affected regions.

Recognizing the gravity of the situation and the urgent need for support, SEED FOUNDATION, in partnership with St. John's College of Arts and Science, Ammandivilai, launched a rice donation drive on 21st August 2018. The initiative mobilized students, management, and staff of the college to contribute rice bags that would be sent directly to flood-affected families in Kerala, providing them with essential food supplies during this critical time.

2. Objectives of the Program
- To provide immediate humanitarian relief to families affected by the 2018 Kerala floods by collecting and distributing essential food supplies.
- To mobilize the college community in a collective effort of compassion and social responsibility toward disaster relief.
- To demonstrate how educational institutions can play a vital role in community support during times of crisis.
- To foster a sense of solidarity and shared humanity among students and staff through direct involvement in relief efforts.
- To send a clear message that help is on the way and that communities are not forgotten in their time of greatest need.

3. Organizing Details
Organized By: SEED FOUNDATION & St. John's College of Arts and Science
Program Name: 2018 Kerala Floods Relief - Rice Donation Drive
Date: 21st August 2018
Venue: St. John's College of Arts and Science, Ammandivilai
Participants: SEED FOUNDATION Team, College students, management, and staff
Mode of Conduct: On-campus rice collection and relief dispatch

The rice donation drive was jointly organized by SEED FOUNDATION and the management of St. John's College of Arts and Science, Ammandivilai. The initiative was conducted at the college campus, where students and staff were invited to contribute rice bags as part of a collective effort to support the flood victims in Kerala.

4. Participants
The program was carried out with the active participation of St. John's College students, college management, and staff members. The collective response from the college community demonstrated a strong sense of social responsibility and compassion, with each participant contributing voluntarily to support those affected by the natural disaster.

5. Activities Conducted
5.1 Rice Collection Campaign
A rice collection campaign was organized at St. John's College of Arts and Science, inviting every student, staff member, and department to contribute rice bags. The campaign was designed to be inclusive and accessible, allowing all members of the college community to participate and contribute according to their capacity.

5.2 Consolidation and Organization
As rice bags were collected from various contributors, they were carefully organized, sorted, and consolidated for dispatch. The SEED FOUNDATION team and college management coordinated the logistics to ensure that all donated rice would be properly packaged and sent to Kerala for distribution to flood-affected families.

5.3 Relief Dispatch
Once all rice bags were collected and organized, arrangements were made to dispatch them to Kerala. The donated rice was sent to relief distribution centers where it would reach families most affected by the floods, providing them with essential food supplies during their time of greatest need.

6. Outcomes and Achievements
- Multiple bags of rice were successfully collected and sent through the donation drive to support families affected by the floods.
- The initiative demonstrated the power of institutional collaboration in times of crisis, bringing together SEED FOUNDATION and St. John's College of Arts and Science.
- The rice donations reached families affected by the Kerala floods, providing essential nutritional support during their recovery.
- The college community was united in a meaningful cause, fostering greater social awareness and compassion among students and staff.
- The program set a strong example of institutional social responsibility and disaster relief action that resonates beyond the campus.

7. Event Photograph
A photograph from the rice donation drive conducted at St. John's College of Arts and Science.

8. Feedback
The response from the college community to the rice donation drive was overwhelmingly positive. Students expressed deep concern for the flood victims and were eager to contribute in any way they could. The college management appreciated the initiative and facilitated the smooth conduct of the program. Faculty members highlighted how the drive created an opportunity for students to engage in meaningful social action and develop a sense of responsibility toward the wider community. Overall, the program reinforced the values of compassion and collective action that are central to the college's mission.

9. Conclusion
The 2018 Kerala Floods Relief - Rice Donation Drive, conducted on 21st August 2018 at St. John's College of Arts and Science, Ammandivilai, successfully channeled the compassion and generosity of the college community toward families devastated by the natural disaster. Through the collection and dispatch of significant quantities of rice, the initiative demonstrated that education institutions can be powerful agents of social change and humanitarian action.

The success of this drive reinforces the importance of rapid, coordinated community response during times of crisis, and highlights how institutions like SEED FOUNDATION and colleges can mobilize resources and human goodwill to make a tangible difference in people's lives. The effort stands as a testament to the resilience and compassion of both the donors and the recipients, and as a reminder that in times of crisis, we are all connected by a shared humanity.

10. Acknowledgement
SEED FOUNDATION extends its sincere gratitude to the management and students of St. John's College of Arts and Science, Ammandivilai, for their remarkable response to this initiative. Special thanks to every student, staff member, and faculty member who contributed rice bags and supported the relief effort. The success of this drive is a direct result of the collective compassion and commitment shown by the entire college community. We also acknowledge the families in Kerala who were affected by the floods and hope that this aid provided some relief during their difficult times.`,
    image: "/images/stories/supporting-families-during-crisis.png",
  },
  {
    slug: "guiding-students-towards-their-future",
    title: "Guiding Students Towards Their Future",
    category: "Education",
    focusArea: "education",
    excerpt:
      "Career guidance sessions in Puthoor Village helped students explore pathways aligned with their aspirations.",
    body: `PROJECT REPORT
Career Guidance Awareness Program
An Initiative by SEED FOUNDATION
Guiding Young Minds Towards a Brighter Future

Program Title: Career Guidance Awareness Program
Date: 12th November 2023
Venue: Puthoor Village
Organized by: SEED FOUNDATION & Fr. SAM MATHEW
Target Group: Village Students
Report Prepared on: 15th November 2023

1. Introduction
Choosing the right career path is one of the most important decisions in a young person's life, yet students in many village communities often lack access to structured guidance, exposure to available opportunities, and clarity about the options open to them after school. Without timely direction, talented students may struggle to make informed decisions about higher education and future careers.

Recognizing this gap, SEED FOUNDATION, in association with Fr. SAM MATHEW, organized a Career Guidance Awareness Program on 12th November 2023 at Puthoor village. The program was designed to introduce students to various career paths, help them understand how to align their interests and strengths with suitable opportunities, and motivate them to plan their futures with greater confidence and clarity.

2. Objectives of the Program
- To introduce village students to a broad range of career options and educational pathways available to them.
- To help students understand how to identify their interests, strengths, and suitable career directions.
- To address common doubts, myths, and misconceptions students may hold about various career choices.
- To provide an open platform for students to ask questions and receive direct, practical guidance.
- To motivate and inspire students to pursue their education and career goals with greater confidence.

3. Organizing Details
Organized By: SEED FOUNDATION & Fr. SAM MATHEW
Program Name: Career Guidance Awareness Program
Date: 12th November 2023
Venue: Puthoor Village
Participants: Village Students
Mode of Conduct: On-site, in-person community gathering

The program was jointly organized by the SEED FOUNDATION team and Fr. SAM MATHEW, who together coordinated the planning and execution of the session. The event was conducted in an informal, welcoming setting that encouraged open dialogue between the students and the speakers throughout the program.

4. Participants
The program was attended by students from Puthoor village, many of whom are at a critical stage of deciding their academic and career direction. The turnout reflected strong interest among the youth of the village in understanding the career opportunities available to them, and participants remained attentive and engaged throughout the session.

5. Activities Conducted
5.1 Career Guidance Session
The SEED FOUNDATION team conducted an informative career guidance session covering a range of educational and professional pathways available to students after school. The session focused on helping students understand how to evaluate their own interests and strengths, explore the options suited to them, and plan realistic, achievable steps towards their chosen careers.

5.2 Question & Answer Session
Following the guidance session, an open Question & Answer segment was held, allowing students to directly engage with the speakers and ask specific questions about courses, entrance exams, career options, and future planning. This interactive format helped clarify individual doubts and made the guidance far more relevant and personal to each student's situation.

6. Outcomes and Achievements
- Village students gained a significantly better understanding of the range of career and educational options available to them.
- Common doubts and misconceptions about various career paths were addressed and clarified through open discussion.
- The interactive Q&A session helped students receive personalized guidance relevant to their individual interests and circumstances.
- Students expressed greater confidence and motivation to plan their future academic and career paths.
- The program strengthened the relationship between the community and SEED FOUNDATION, laying the groundwork for future guidance initiatives.

7. Event Photograph
A glimpse of the Career Guidance Awareness Program conducted at Puthoor village.

8. Feedback
The response from the students of Puthoor village was positive and encouraging. Participants appreciated the clarity and practicality of the guidance provided, and many expressed that the session had helped them think more seriously about their future career options. The open Question & Answer format was particularly well received, as it gave students the confidence to voice their individual concerns and receive direct, relevant advice. Several students conveyed interest in attending similar guidance programs in the future.

9. Conclusion
The Career Guidance Awareness Program conducted at Puthoor village on 12th November 2023 successfully achieved its objective of equipping students with valuable insights into their future academic and career choices. Through an informative session and an engaging Question & Answer segment, SEED FOUNDATION and Fr. SAM MATHEW were able to leave a lasting, positive impact on the students, empowering them to approach their futures with greater clarity and confidence.

The success of this initiative reaffirms the importance of accessible career guidance at the grassroots level, particularly for students in village communities who may otherwise lack exposure to such opportunities. SEED FOUNDATION remains committed to continuing such outreach efforts and extending career guidance support to more villages and communities in the region.

10. Acknowledgement
SEED FOUNDATION extends its sincere gratitude to Fr. SAM MATHEW for his valuable support and collaboration in organizing this program, and to the students and residents of Puthoor village for their warm participation and enthusiasm. Special thanks to all team members who dedicated their time and effort towards planning, organizing, and conducting this career guidance awareness program.`,
    image: "/images/stories/guiding-students-towards-their-future.png",
  },
];

export const APPROACH_STEPS = [
  {
    title: "Listen",
    description: "Understand community needs through engagement and discussion.",
  },
  {
    title: "Educate",
    description: "Provide practical information through awareness sessions and interactive learning.",
  },
  {
    title: "Engage",
    description: "Encourage participation through open dialogue and community involvement.",
  },
  {
    title: "Act",
    description:
      "Translate awareness into meaningful action through campaigns, clean-up drives, relief efforts, or educational support.",
  },
  {
    title: "Strengthen",
    description:
      "Build relationships that encourage continued community participation and future initiatives.",
  },
] as const;

export const IMPACT = {
  audiences: [
    "Village communities",
    "School students",
    "College students",
    "Educational institutions",
    "Local residents",
    "Coastal communities",
    "Volunteers and community partners",
  ],
  outcomes: [
    "Increased awareness of cancer prevention and early detection",
    "Greater openness to conversations about mental health",
    "Improved understanding of career opportunities among students",
    "Increased environmental responsibility through coastal conservation efforts",
    "Community participation in humanitarian relief initiatives",
  ],
} as const;

export const ABOUT = {
  whoWeAre: [
    "SEED FOUNDATION is a community-focused nonprofit organization that designs and delivers awareness programs, educational initiatives, environmental campaigns, and humanitarian relief efforts. Across every initiative, our focus remains the same: helping communities gain knowledge, strengthen resilience, and improve wellbeing through participation and collaboration.",
    "The projects documented in our reports demonstrate work with village communities, students, educational institutions, local residents, and community partners across Tamil Nadu.",
  ],
  approachIntro:
    "Every program begins by understanding a community's needs. We then bring together local partners, community members, educators, volunteers, and institutions to create initiatives that are practical, accessible, and locally relevant.",
  principles: [
    "Awareness through education",
    "Community participation",
    "Open dialogue",
    "Practical action",
    "Long-term community engagement",
  ],
} as const;

export const GET_INVOLVED = {
  intro:
    "Positive change grows through collaboration. Whether you are a student, educator, volunteer, community leader, or institution, there are opportunities to participate in awareness programs, community initiatives, educational outreach, and humanitarian activities that strengthen communities together.",
  paths: [
    {
      id: "volunteer",
      title: "Volunteer",
      description:
        "Join community programs as a facilitator, organizer, or supporter. Volunteers help deliver sessions, mobilize partners, and bring practical action to the ground.",
    },
    {
      id: "partner",
      title: "Partner",
      description:
        "Schools, colleges, and community organizations can collaborate with SEED FOUNDATION on programs that are locally relevant and participatory.",
    },
  ],
} as const;

export const WORK_AREAS = [
  {
    id: "health" as FocusArea,
    title: "Health",
    description:
      "We organize awareness initiatives that encourage early detection, reduce stigma, improve public understanding, and promote preventive healthcare.",
  },
  {
    id: "education" as FocusArea,
    title: "Education",
    description:
      "We help students explore career pathways, understand educational opportunities, and make informed academic decisions through interactive guidance sessions.",
  },
  {
    id: "environment" as FocusArea,
    title: "Environment",
    description:
      "Our environmental initiatives combine awareness with action by encouraging waste segregation, installing public waste infrastructure, and leading coastal cleanup campaigns.",
  },
  {
    id: "disaster-relief" as FocusArea,
    title: "Disaster Relief",
    description:
      "We coordinate community-led humanitarian responses that mobilize institutions and volunteers to provide essential support to affected families.",
  },
];

export function getProgram(slug: string) {
  return PROGRAMS.find((p) => p.slug === slug);
}

export function getStory(slug: string) {
  return STORIES.find((s) => s.slug === slug);
}
