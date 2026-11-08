export interface CareerAssessmentQuestion {
  question: string;
  type: "multiple-choice" | "text";
  options?: string[];
  section: string;
}

export const ASSESSMENT_SECTION_LABELS: Record<string, string> = {
  sahiraah: "Career Interests & Skills",
  career_interests: "Career Interests",
  skills: "Skills Assessment",
  values: "Core Values & Work Style",
  aptitude: "Situational & Aptitude",
  reflection: "Open Reflection",
};

const mcq = (
  section: string,
  question: string,
  options: [string, string, string, string]
): CareerAssessmentQuestion => ({
  section,
  question,
  type: "multiple-choice",
  options: options.map((option, index) => `${"ABCD"[index]}. ${option}`),
});

const text = (question: string): CareerAssessmentQuestion => ({
  section: "reflection",
  question,
  type: "text",
});

/**
 * Fixed career assessment drawn from the Sahiraah question set and the
 * career-interest / skills questionnaires. Questions that appear in more
 * than one source are included once.
 * Multiple choice comes first; the five written questions are last.
 */
export const careerAssessmentQuestions: CareerAssessmentQuestion[] = [
  // Sahiraah Questions — multiple choice (includes items shared with the other questionnaires)
  mcq("sahiraah", "Which word best describes your personality?", [
    "Imaginative",
    "Analytical",
    "Empathetic",
    "Organized",
  ]),
  mcq("sahiraah", "What type of problems in the world interest you most?", [
    "Environmental or design challenges",
    "Technological or scientific problems",
    "Social issues like education or equality",
    "Economic or organizational challenges",
  ]),
  mcq("sahiraah", "What motivates you to work hard?", [
    "Achieving goals and measurable success",
    "Bringing creative ideas to life",
    "Making a difference for others",
    "Solving complex or technical problems",
  ]),
  mcq("sahiraah", "How do you like to learn new things?", [
    "By experimenting and hands-on practice",
    "By observing or visualizing",
    "By discussing or teaching others",
    "By reading, researching, and analyzing",
  ]),
  mcq("sahiraah", "What kind of activities make you lose track of time?", [
    "Creating, designing, or imagining new things",
    "Solving puzzles or analyzing how things work",
    "Talking to people or helping others",
    "Organizing, planning, or managing tasks",
  ]),
  mcq("sahiraah", "What do you enjoy learning about the most?", [
    "Art, creativity, and human expression",
    "Technology, science, and systems",
    "Psychology, education, and people",
    "Business, organization, and strategy",
  ]),
  mcq("sahiraah", "How do you usually handle deadlines?", [
    "I stay calm and use creativity to find shortcuts",
    "I plan systematically and finish ahead of time",
    "I rely on collaboration to stay on track",
    "I create structure and check progress regularly",
  ]),
  mcq("sahiraah", "When faced with failure, what do you usually do first?", [
    "Reflect and find creative alternatives",
    "Analyze the mistake and learn from it",
    "Talk it out and seek feedback",
    "Regroup and make a structured new plan",
  ]),
  mcq("sahiraah", "How do you approach decision-making?", [
    "Based on logic and data",
    "Based on intuition and creativity",
    "Based on how it impacts others",
    "Based on practicality and efficiency",
  ]),
  mcq("sahiraah", "What motivates you most when you wake up to work/study?", [
    "The desire to create something original and new",
    "The goal of helping people directly and making a difference",
    "The pursuit of mastery and being the best in a field",
    "The opportunity to earn a good income and achieve financial stability",
  ]),
  mcq("aptitude", "Which word describes you best?", [
    "Imaginative",
    "Curious",
    "Caring",
    "Organized",
  ]),
  mcq("aptitude", "Your best friend is upset because they got fewer marks than expected. What will you do?", [
    "Tell them not to cry and move on",
    "Listen to them and make them feel better",
    "Compare your marks with theirs",
    "Avoid talking about it",
  ]),
  mcq("aptitude", "You're part of a group project, and one teammate isn't doing their share of work. How will you handle it?", [
    "Do their part quietly to finish the project",
    "Get angry and complain to the teacher",
    "Talk calmly to them and understand what's wrong",
    "Ignore it and focus only on your part",
  ]),
  mcq("aptitude", "If 5 pencils cost ₹25, how many pencils can you buy for ₹100?", [
    "15",
    "20",
    "25",
    "30",
  ]),
  mcq("aptitude", "A train leaves Mangaluru at 6:30 AM and reaches Udupi at 8:00 AM. Another train leaves Udupi at 7:15 AM and reaches Mangaluru at 8:45 AM. At what time do the two trains meet if they travel at the same speed?", [
    "7:30 AM",
    "7:37 AM",
    "7:45 AM",
    "7:50 AM",
  ]),

  // Career and Skills Assessment — Career Interests
  mcq("career_interests", "Which kind of book or podcast genre are you most drawn to?", [
    "Science, technology, and academic deep-dives.",
    "Biographies, history, and current affairs.",
    "Self-improvement, psychology, and personal finance.",
    "Fiction, creative arts, and philosophy.",
  ]),
  mcq("career_interests", "Your ideal long-term career goal involves:", [
    "Leading a large team or department.",
    "Becoming a recognized expert or thought leader in a niche field.",
    "Running your own independent business or consultancy.",
    "Working on complex, novel challenges with a rotating team.",
  ]),
  mcq("career_interests", "When giving feedback, your focus is primarily on:", [
    "Identifying specific, measurable areas for improvement.",
    "Encouraging the person and highlighting their strengths.",
    "Ensuring the process was followed correctly.",
    "Discussing how the result impacts the overall goal.",
  ]),
  mcq("career_interests", "What aspect of a news story captures your attention the most?", [
    "The economic impact or financial figures.",
    "The human-interest angle and personal stories.",
    "The underlying political or social systems involved.",
    "The technological or scientific breakthrough announced.",
  ]),
  mcq("career_interests", "When starting a new hobby, your first step is usually to:", [
    "Buy the best equipment and tools you can afford.",
    "Find a community or club to join immediately.",
    "Watch tutorials and practice the basic techniques until mastered.",
    "Develop a long-term project or creative goal.",
  ]),
  mcq("career_interests", "Your comfort level with ambiguity and lack of structure is:", [
    "Very high; I thrive in environments where I define the structure.",
    "Moderate; I can manage but prefer a clear plan eventually.",
    "Low; I need clear guidelines and defined parameters to perform well.",
    "It depends on the risk; I'll embrace ambiguity for high rewards.",
  ]),
  mcq("career_interests", "If you could have one superpower, which would you choose?", [
    "Telekinesis: To physically manipulate and build things perfectly.",
    "Mind-Reading: To understand what people truly need and want.",
    "Super-Speed: To complete tasks and projects instantly.",
    "Precognition: To know all the facts and potential outcomes before acting.",
  ]),
  mcq("career_interests", "How do you prefer to manage a budget (personal or project)?", [
    "Create detailed, itemized spreadsheets and track everything.",
    "Set broad limits and adjust as opportunities arise.",
    "Consult with financial software or an advisor frequently.",
    "Prioritize investment in resources that lead to the greatest return.",
  ]),
  mcq("career_interests", "What kind of puzzle or game appeals to you most?", [
    "Strategy games like chess or complex board games.",
    "Building games like Minecraft or sandbox simulators.",
    "Social deduction games or party games that involve communication.",
    "Logic puzzles like Sudoku or escape rooms.",
  ]),
  mcq("career_interests", "When learning about a product or service, what convinces you most?", [
    "The underlying technology and specs (how it works).",
    "Testimonials and reviews from real users (the benefit).",
    "The reputation and history of the company (the trustworthiness).",
    "A clear, well-designed demonstration of its function (the experience).",
  ]),

  // New Career Interest & Skills Assessment — Career Interests (motivation item is already in the Sahiraah set)
  mcq("career_interests", "When starting a new project, what role do you naturally prefer to take on in a team?", [
    "The Visionary: Defining the overall goal and direction.",
    "The Executor: Managing the tasks and ensuring work gets done on time.",
    "The Investigator: Researching and gathering all the necessary data.",
    "The Communicator: Coordinating between team members and presenting the final result.",
  ]),
  mcq("career_interests", "What part of a smartphone/computer interests you the most?", [
    "The internal working (hardware, components).",
    "The user experience (design, flow, and ease of use).",
    "The data it holds (security, storage, and organization).",
    "The new applications and software features.",
  ]),
  mcq("career_interests", "When faced with a complex problem, what is your first step?", [
    "Break it down into smaller, manageable pieces.",
    "Consult with others who have faced similar problems.",
    "Look for a creative, outside-the-box solution.",
    "Analyze the data and facts related to the problem.",
  ]),
  mcq("career_interests", "Which environment do you feel you learn best in?", [
    "A highly structured environment with clear instructions and deadlines.",
    "A flexible, hands-on environment where you learn by doing.",
    "A collaborative environment where ideas are constantly discussed.",
    "An independent environment focused on deep reading and research.",
  ]),
  mcq("career_interests", "If you had extra money to spend on personal development, where would it go?", [
    "Buying high-quality tools or equipment for a hobby.",
    "Attending a conference or seminar to network with experts.",
    "Taking a specialized course or certification.",
    "Investing in a mentor or coach for personalized guidance.",
  ]),
  mcq("career_interests", "Which kind of website or app do you spend the most time on?", [
    "News, analysis, or documentary platforms.",
    "Social media or communication platforms.",
    "Gaming or entertainment platforms.",
    "Learning, DIY, or skill-building platforms.",
  ]),
  mcq("career_interests", "How do you prefer to get your ideas across to others?", [
    "A detailed written report or email.",
    "A structured presentation with clear slides/visuals.",
    "A face-to-face discussion or meeting.",
    "A quick phone call or brief summary.",
  ]),
  mcq("career_interests", "When dealing with a conflict or disagreement, you tend to:", [
    "Analyze the root cause and find a logical compromise.",
    "Step back and let the others resolve it themselves.",
    "Mediate and ensure everyone feels heard and respected.",
    "Stick firmly to your own view if you believe the facts support it.",
  ]),
  mcq("career_interests", "If a task requires either high precision or high speed, you prioritize:", [
    "Precision, even if it takes longer.",
    "Speed, to move on to the next task quickly.",
    "A balance between both, adjusting based on the task.",
    "Delegation, finding the person best suited for the requirement.",
  ]),

  // Career and Skills Assessment — Skills
  mcq("skills", "Which skill are you most often complimented on by colleagues/peers?", [
    "Analytical thinking: The ability to see patterns and draw conclusions.",
    "Practicality: The ability to fix things or implement solutions quickly.",
    "Empathy: The ability to understand and relate to people's emotional state.",
    "Creativity: The ability to generate unique concepts or designs.",
  ]),
  mcq("skills", "When organizing a large amount of information, your method is to:", [
    "Categorize it all into a structured, labeled database.",
    "Create a visually compelling presentation or infographic.",
    "Prioritize the information by urgency and importance for action.",
    "Discuss the data with others to find a consensus on the best structure.",
  ]),
  mcq("skills", "When you make a mistake, your immediate reaction is to:", [
    "Immediately start documenting the error to understand the root cause.",
    "Apologize and focus on fixing the damage or impact on others.",
    "Quickly devise a new, improved process to prevent it from happening again.",
    "Ask others for their interpretation of what went wrong.",
  ]),
  mcq("skills", "Which statement about technology best reflects your view?", [
    "Technology is primarily a tool to optimize efficiency and save time.",
    "Technology is a platform for personal expression and connection.",
    "Technology is a subject for deep study and continuous improvement.",
    "Technology is a means to an end, used only when it solves a clear problem.",
  ]),
  mcq("skills", "You are best at influencing others by using:", [
    "Logic, data, and clear, evidence-based arguments.",
    "Inspirational stories and emotional appeals.",
    "Your personal credibility and track record of success.",
    "Collaboration, compromise, and building consensus.",
  ]),
  mcq("skills", "When under stress or facing a deadline, you tend to:", [
    "Work faster and focus intensely on the essential tasks.",
    "Step back to re-evaluate the plan and delegate tasks.",
    "Seek support from others and communicate my stress level.",
    "Become highly organized, meticulous, and detail-oriented.",
  ]),
  mcq("skills", "If you were a manager, which would be your preferred reward for a job well done?", [
    "A public commendation and professional recognition.",
    "A bonus or financial incentive.",
    "A challenging new project or greater responsibility.",
    "Additional training or educational resources.",
  ]),
  mcq("skills", "Your general approach to making big decisions is to:", [
    "Follow your gut feeling and intuition, then justify it later.",
    "Use a decision-making matrix or pros/cons list.",
    "Delay until you can gather input from all relevant stakeholders.",
    "Model the potential outcomes and choose the mathematically best option.",
  ]),
  mcq("skills", "What phrase best captures your personal motto?", [
    '"Measure twice, cut once."',
    '"Done is better than perfect."',
    '"The greatest good for the greatest number."',
    '"If you can dream it, you can do it."',
  ]),
  mcq("skills", "How comfortable are you performing a task you've never done before?", [
    "Highly comfortable; I see it as a thrilling learning opportunity.",
    "Moderately comfortable, but I'd insist on having clear guidelines.",
    "Somewhat uncomfortable; I prefer to stick to my expertise.",
    "I'm comfortable, provided I have someone experienced to shadow or ask questions.",
  ]),

  // New Career Interest & Skills Assessment — Skills
  mcq("skills", "Which word best describes a situation where you feel most energized?", [
    "Innovating (creating something new).",
    "Serving (helping others achieve a goal).",
    "Organizing (bringing order to chaos).",
    "Investigating (uncovering hidden information).",
  ]),
  mcq("skills", "What is your biggest concern about a potential career path?", [
    "The job will become repetitive or boring over time.",
    "The field lacks opportunities for growth or advancement.",
    "The work will not be morally or ethically fulfilling.",
    "The industry might become irrelevant due to new technology.",
  ]),
  mcq("skills", "When planning a trip, what do you enjoy doing the most?", [
    "Setting the budget and finding the best deals (Financial).",
    "Choosing the destinations and activities (Creative).",
    "Researching the local culture and history (Analytical).",
    "Inviting and coordinating with the friends/family going (Social).",
  ]),
  mcq("skills", "What is your attitude toward repetitive, detail-oriented work?", [
    "I enjoy it; it helps me focus and ensures accuracy.",
    "I tolerate it but prefer tasks with more variety.",
    "I find it boring and would always look for a way to automate it.",
    "I delegate it to others whenever possible.",
  ]),
  mcq("skills", "Which type of resource would you most likely use to teach yourself a new skill?", [
    "A highly technical textbook or white paper.",
    "A video tutorial or practical online course.",
    "A real-world apprenticeship or internship.",
    "A self-guided, trial-and-error approach.",
  ]),
  mcq("skills", "Which personal quality is most important to maintain trust with others?", [
    "Reliability (always doing what you promised).",
    "Openness (always being truthful).",
    "Empathy (always understanding their feelings).",
    "Competence (always being skilled enough for the job).",
  ]),
  mcq("skills", "If you suddenly inherited a large sum of money, you would most likely:", [
    "Invest it smartly to make it grow over time.",
    "Start a new business or launch a creative project.",
    "Use it to fund a cause or charity you believe in.",
    "Buy something valuable that you can keep and maintain.",
  ]),
  mcq("skills", "When you encounter a technical glitch or software bug, what do you do?", [
    "Immediately search online forums or documentation for a fix.",
    "Ask a tech-savvy friend or colleague for help.",
    "Keep trying different solutions until you figure it out.",
    "Report the issue and wait for someone else to fix it.",
  ]),
  mcq("skills", "What kind of legacy or impact would you most like to leave behind?", [
    "To have created a widely used tool or system.",
    "To have trained or mentored many successful people.",
    "To have made a major scientific or research discovery.",
    "To have built a successful, long-lasting organization.",
  ]),
  mcq("skills", "In a perfect world, your work attire would be:", [
    "A formal uniform or professional business suit.",
    "Casual, comfortable clothes that allow movement.",
    "Something unique or artistic that expresses your personality.",
    "Standard smart-casual attire.",
  ]),

  // Career and Skills Assessment — Core Values & Work Style
  mcq("values", "What provides you with the greatest feeling of professional satisfaction?", [
    "Completing a complex project under budget and ahead of schedule.",
    "Seeing an idea you created be used widely and successfully.",
    "Successfully mentoring someone and watching them advance their career.",
    "Solving a difficult, previously unsolvable technical mystery.",
  ]),
  mcq("values", "In a workplace, you are most likely to criticize:", [
    "Inefficient processes or unnecessary bureaucracy.",
    "Lack of imagination or creative stagnation.",
    "Unfair treatment or poor team communication.",
    "Shallow analysis or decisions not backed by facts.",
  ]),
  mcq("values", "How do you feel about working with constantly changing specifications or goals?", [
    "Frustrated; it makes precise, quality work nearly impossible.",
    "Challenged; I enjoy the need to adapt and strategize.",
    "Energetic; it means the work is dynamic and exciting.",
    "Concerned; I worry about the team's morale and resource allocation.",
  ]),
  mcq("values", "If you had to teach a class, what subject would you be best at?", [
    "Advanced mathematics or a scientific discipline.",
    "Public speaking or negotiations.",
    "Creative writing or art history.",
    "Project management or efficiency training.",
  ]),
  mcq("values", "Which value is most important to you in a team culture?", [
    "Accountability and clear metrics for success.",
    "Inclusivity and a positive, supportive atmosphere.",
    "Innovation and freedom to experiment.",
    "Expertise and a focus on high-quality mastery.",
  ]),
  mcq("values", "What is your preferred method for saving personal documents and files?", [
    "A highly specific, chronological folder structure on a local drive.",
    "Using cloud services with powerful search and indexing capabilities.",
    "Printing key documents for a physical, tangible record.",
    "Relying on an automated backup and sorting system.",
  ]),
  mcq("values", "Which word best describes your natural state when working?", [
    "Disciplined (focused and adherence to plan).",
    "Curious (exploring and asking 'why').",
    "Engaged (interacting and collaborating).",
    "Driven (pushing toward a tangible result).",
  ]),
  mcq("values", "Your greatest reservation about taking on a management role is:", [
    "Dealing with the necessary administrative and repetitive tasks.",
    "Being too far removed from the actual hands-on work.",
    "Having to resolve interpersonal conflicts between employees.",
    "The pressure of being ultimately responsible for the outcome.",
  ]),
  mcq("values", "When considering a job offer, what is the least negotiable factor for you?", [
    "The opportunity for continuous technical or academic learning.",
    "The company's mission and ethical values.",
    "A guaranteed work-life balance and schedule flexibility.",
    "The clarity of the role's responsibilities and performance metrics.",
  ]),
  mcq("values", "How do you handle deadlines that are clearly impossible to meet?", [
    "I clearly communicate the conflict and propose a revised, realistic timeline.",
    "I work relentlessly to come as close as possible to the impossible deadline.",
    "I figure out the one crucial part that must be delivered, and I focus only on that.",
    "I try to rally the team to creatively find new ways to accelerate the process.",
  ]),

  // Career Interest & Skills Assessment — items not already asked above
  mcq("sahiraah", "If you could learn any skill instantly, what would it be?", [
    "Building or inventing something technical",
    "Expressing creativity (art, music, writing)",
    "Inspiring or leading people",
    "Managing systems or growing businesses",
  ]),
  mcq("sahiraah", "What gives you the most satisfaction at the end of the day?", [
    "When I've built or fixed something that works",
    "When I've created or expressed something unique",
    "When I've helped or guided someone",
    "When I've completed everything efficiently",
  ]),
  mcq("sahiraah", "Which environment do you thrive best in?", [
    "Creative and flexible spaces",
    "Structured and stable environments",
    "Collaborative and people-oriented spaces",
    "Independent and focused environments",
  ]),
  mcq("sahiraah", "When working on a project, what role do you naturally take?", [
    "Idea generator or designer",
    "Researcher or analyst",
    "Communicator or motivator",
    "Planner or coordinator",
  ]),
  mcq("sahiraah", "Which of the following best describes your dream job?", [
    "Inventing or designing innovative products",
    "Researching and solving complex problems",
    "Teaching, mentoring, or helping others",
    "Managing teams or organizing operations",
  ]),
  mcq("sahiraah", "What would you most enjoy leading?", [
    "A creative campaign or design project",
    "A technical or data-driven experiment",
    "A community or educational initiative",
    "A business or operational plan",
  ]),
  mcq("sahiraah", "What brings you a sense of accomplishment?", [
    "Completing a creative or unique project",
    "Finding solutions to difficult problems",
    "Seeing someone grow because of me",
    "Reaching a planned goal successfully",
  ]),
  mcq("sahiraah", "How would you prefer to spend your workday?", [
    "Brainstorming and creating ideas",
    "Analyzing data and solving issues",
    "Interacting and helping people",
    "Planning and executing operations",
  ]),
  mcq("sahiraah", "What kind of work environment motivates you?", [
    "Artistic, free-flowing spaces",
    "Structured and detail-focused settings",
    "People-centered, collaborative places",
    "Organized and goal-driven workplaces",
  ]),
  mcq("sahiraah", "Which of these outcomes feels most rewarding to you?", [
    "Creating something new",
    "Solving a tough problem",
    "Making someone happy or confident",
    "Achieving a well-planned goal",
  ]),
  mcq("sahiraah", "What kind of success story inspires you most?", [
    "Innovators who created something revolutionary",
    "Scientists who discovered something impactful",
    "Leaders who changed lives or empowered others",
    "Entrepreneurs who built sustainable systems",
  ]),

  // Sahiraah Questions — written responses
  text("Describe what your ideal work or study environment looks like, including the pace, people, and setting you prefer."),
  text("If you were leading a group project, how would you ensure it is completed successfully? Mention your steps or strategies."),
  text("Tell me about a time you were offered something new outside your comfort zone. How did you respond and why?"),
  text("What kind of challenges or problems excite you the most, and can you give an example from your experience?"),
  text("Where do you see yourself in 10 years, and what kind of work or impact do you want to have then?"),
];
