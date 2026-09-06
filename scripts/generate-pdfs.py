#!/usr/bin/env python3
"""Generate PDF documents for BWNA Bylaws and Policies."""

from fpdf import FPDF

class BWNADocument(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 92, 58)
        self.cell(0, 8, "Beaumont-Wilshire Neighborhood Association", align="C", new_x="LMARGIN", new_y="NEXT")
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def add_title(self, title):
        self.set_font("Helvetica", "B", 20)
        self.set_text_color(30, 92, 58)
        self.cell(0, 14, title, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)

    def add_subtitle(self, text):
        self.set_font("Helvetica", "I", 11)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, text, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(6)

    def add_heading(self, text):
        self.ln(4)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(30, 92, 58)
        self.cell(0, 10, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def add_subheading(self, text):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(51, 51, 51)
        self.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def add_paragraph(self, text, indent=0):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(51, 51, 51)
        # Replace unicode characters unsupported by latin-1
        text = text.replace("\u2014", "--").replace("\u2013", "-")
        text = text.replace("\u2018", "'").replace("\u2019", "'")
        text = text.replace("\u201c", '"').replace("\u201d", '"')
        x = self.l_margin + indent
        w = self.w - self.l_margin - self.r_margin - indent
        self.set_x(x)
        self.multi_cell(w, 5.5, text)
        self.ln(2)


def generate_bylaws():
    pdf = BWNADocument()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    pdf.add_title("BWNA Bylaws")
    pdf.add_subtitle("Adopted December 9, 2024")

    # Article 1
    pdf.add_heading("ARTICLE 1: NAME AND PURPOSE")

    pdf.add_subheading("Section 1: Name")
    pdf.add_paragraph("The name of the association shall be the Beaumont-Wilshire Neighborhood Association (hereinafter BWNA). BWNA is organized under Oregon Revised Statutes Chapter 65 and recognizes the standards established by the City of Portland for Neighborhood Associations.")

    pdf.add_subheading("Section 2: Purpose")
    pdf.add_paragraph("Subject to the limitations stated in the Articles of Incorporation, the purpose of this BWNA corporation shall be to engage in any lawful activities, none of which are for profit, for which corporations may be organized under Chapter 65 of the Oregon Revised Statutes (or its corresponding future provisions).")
    pdf.add_paragraph("This corporation's primary purpose shall be:")
    purposes = [
        "A. To enhance the livability of the Beaumont-Wilshire neighborhood by undertaking various neighborhood improvement projects, examining local issues, and serving as a conduit for communication among neighbors, government agencies and officials, area businesses, and other neighborhood institutions and groups.",
        "B. To provide, encourage, and facilitate open processes whereby all members of BWNA may involve themselves in, and be heard on, the issues, affairs, and concerns of the neighborhood.",
        "C. To perform all activities related to the purposes enumerated above. To have and enjoy all the powers granted, vested, or allowed BWNA by law.",
        "D. To organize exclusively for educational, scientific, environmental, and charitable purposes as prescribed by law.",
        'E. To be inclusive of all. Committed to diversity and equity in all our activities, BWNA may not discriminate against individuals or groups on the basis of race, ethnicity, religion, color, sex, sexual orientation, gender identity, age, disability, legal citizenship, national origin, income, political affiliation in any of its policies, recommendations, or actions.',
        "F. To work in collaboration with the Beaumont Business Association and the other nearby Neighborhood Associations allied through BWNA's District Coalition (hereinafter DC).",
    ]
    for p in purposes:
        pdf.add_paragraph(p, indent=8)

    # Article 2
    pdf.add_heading("ARTICLE 2: BOUNDARIES")
    pdf.add_paragraph("The boundaries are defined as follows: starting at NE 47th and Prescott; south to Wistaria Drive; west to Stanton; west to 37th; north to Morris; west to 33rd; north to Alberta Court; east to 42nd; south to Prescott; east to 47th.")

    # Article 3
    pdf.add_heading("ARTICLE 3: MEMBERSHIP AND VOTING")

    pdf.add_subheading("Section 1: Membership")
    pdf.add_paragraph("A. Eligibility: All residents 18 years of age or older within the boundaries of BWNA are eligible to become members. Representatives of non-resident property owners, government agencies, businesses, and nonprofit organizations located within the boundaries of BWNA are eligible to become members at the rate of one representative per entity.")
    pdf.add_paragraph("B. There are no dues or initiation fees.")

    pdf.add_subheading("Section 2: Voting")
    voting = [
        "A. All votes are contingent on having a quorum of BWNA Board members present, as outlined in Article 6, Section 6.",
        "B. As enumerated in Article 6 below, regular monthly meetings of BWNA alternate between Board Meetings and General Meetings. Though all meetings are open to all residents, voting protocols are different for the two types of meeting.",
        "C. At Board Meetings, only BWNA Board members may vote. Decisions shall be determined by a majority vote of all board members present. No absentee or proxy voting will be allowed.",
        u"D. At General Meetings, all members in attendance may vote on any matter, but depending on the issue, those votes may be determinative or advisory. For three specific issues\u2014the election of BWNA Board members, the approval of BWNA bylaw changes, or the dissolution or merger of the organization\u2014all decisions shall be determined by a majority vote of all B-W residents 18 or older who are present at the meeting.",
        "E. At General Meetings, any decision on any issue besides the three enumerated above can occasion a vote of all B-W residents on an advisory basis, but after that input the BWNA Board will take a final vote and the decision will be determined by a majority of board members present. No absentee or proxy voting will be allowed.",
        "F. In the event of any circumstance requiring a BWNA meeting to be held online (such as a pandemic or wildfire smoke), the above voting protocols still apply.",
        "G. Voting at meetings may be done orally, by a show of hands, or by a written ballot that contains the name of the member voting and the vote of that member. For elections of officers and board members, voting may be done by a secret ballot.",
    ]
    for v in voting:
        pdf.add_paragraph(v, indent=8)

    # Article 4
    pdf.add_heading("ARTICLE 4: FUNDING")
    pdf.add_paragraph("Activities to raise funds for BWNA may be held as appropriate.")

    # Article 5
    pdf.add_heading("ARTICLE 5: BOARD OF DIRECTORS")

    pdf.add_subheading("Section 1: Composition")
    pdf.add_paragraph("Composition of the BWNA Board of Directors (hereinafter the board): The board shall be composed of a President, Vice President, Secretary, Treasurer, and the Immediate Past President (hereinafter the officers), plus up to ten members at large. Each board officer and member is in office for a term of two years. Annual elections shall be held at the annual membership meeting held in April.")

    pdf.add_subheading("Section 2: Duties of Board Members")
    duties = [
        "A. President (elected in even years): Subject to the approval of the board, the President shall prepare and disseminate to the board at least seven days in advance the agenda for Board, General and Special Membership Meetings. The agenda needs to be approved at the beginning of each meeting. The President shall submit a copy of each meeting agenda to the BWNA NC, post on the BWNA website, and arrange for copies of the most current BWNA Newsletter to be delivered to the BWNA NC Office. When present, the President shall preside at Board, General, Emergency, and Special Membership Meetings.",
        "B. Vice President (elected in odd years): The Vice President shall work in partnership with the President. In the President's absence the Vice President shall function as the President. If the President resigns, the Vice President will serve as the Interim President until the next scheduled election.",
        "C. Secretary (elected in odd years): The Secretary shall keep written minutes of all general, board, and special membership meetings and submit those minutes, following approval by the board, for posting to the BWNA website with a copy to the BWNA DC; shall keep written copies of the bylaws up to date; shall maintain the list of members; and shall make records of BWNA available for inspection for any proper purpose at any reasonable time. The Secretary shall work with the President to complete correspondence as needed. The Secretary shall track and retain the conflict-of-interest statements that all members of the board must complete annually.",
        "D. Treasurer (elected in even years): The Treasurer shall be held accountable for all funds and shall give an accounting at General and Board Meetings, submitting all accounting reports (including bank statements) to the BWNA NC; shall invoice for, receive, safe keep, and disburse BWNA funds, either by paper or electronic means; and shall complete and submit required annual reports to state oversight agencies. The President, Vice President, and Treasurer shall each be authorized signers. Any combination of two signatures of the authorized signers shall constitute valid disbursement.",
        "E. Immediate Past President: The Immediate Past President of BWNA shall serve as an advisor and as a voting member of the board. This is not an elected position.",
        "F. Ten At-Large Members: Positions 1, 2, 3, ...10. Odd-numbered positions are to be elected in odd years, even-numbered positions in even years. It is the responsibility of board members to take on tasks as agreed upon.",
    ]
    for d in duties:
        pdf.add_paragraph(d, indent=8)

    pdf.add_subheading("Section 3: Duties of the Board")
    board_duties = [
        "A. Powers of the Board: The board shall be responsible for reviewing and acting upon, as needed, all business coming before the neighborhood association and for assuring that members are informed of the business that affects them through reasonable means of notification. The board has the responsibility of acting in the best interest of the neighborhood. The board will take under advisement all discussion by neighborhood members but is not bound to act according to the desire of the majority of members attending a neighborhood association meeting.",
        "B. Management: The board shall make decisions and represent the interests of the neighborhood association on all matters for which it is impractical to present to the membership in advance. The board shall be accountable to the membership; shall seek the views of those affected by any proposed policies or actions before adopting any recommendation on behalf of BWNA; and shall comply with these bylaws.",
        "C. Vacancies: Written resignations from the board will be accepted. At the third consecutive unexcused absence by a board member, the member will be considered as having abandoned the position and it is vacant. The board may fill any vacancy on the board or a committee by majority vote of the board at the next scheduled General or Board Meeting. A member appointed to fill a vacancy shall serve the remainder of the unexpired term.",
        "D. Emergency Powers: In such cases where the board is required to provide neighborhood response before the question is presented to the membership, the board must indicate that this is the case and shall present the action taken at the next General Meeting or at a Special Membership Meeting for review by the membership.",
        "E. Conflict of Interest: To protect the integrity of the association's decision-making processes, board members will disclose to the board any interest they have in a transaction or decision of the board that may result in a financial benefit or gain to them and/or their business, family members and/or significant other, employer, and/or close associates, and other nonprofit organizations with which they are affiliated. The board member will not participate in any board discussion of or vote on the transaction or decision.",
    ]
    for d in board_duties:
        pdf.add_paragraph(d, indent=8)

    # Article 6
    pdf.add_heading("ARTICLE 6: MEETINGS")

    pdf.add_subheading("Section 1: Membership Meetings")
    pdf.add_paragraph("A. Annual Meetings: The annual meeting shall be held each year at the General Meeting in April. The business of this annual meeting shall include a report from the board on the state of the association and the annual election of at-large board members and officers. Notice of the annual meeting to the public must be at least seven days in advance.", indent=8)
    pdf.add_paragraph("B. General Meetings: General Meetings shall be held each year in the months of February, April, June, October, and December. The meetings shall be convened at a time and day decided upon by the majority vote of the board. All General Meetings shall require seven days advance notice.", indent=8)
    pdf.add_paragraph("C. Special Membership Meetings: The board may call a Special Membership Meeting. Notice of special meetings to BWNA members and to the public must be at least seven days in advance.", indent=8)

    pdf.add_subheading("Section 2: Board Meetings")
    pdf.add_paragraph("A. Board Meetings: Board meetings shall be held each year in the months of January, March, May, July, September, and November and at any other time set either by the President or by one-half of the board. At least seven days advance notice of each meeting shall be given to each board member.", indent=8)
    pdf.add_paragraph("B. Special Board Meetings: The President may call a Special Board Meeting when the timeliness of a regular meeting is insufficient to take action on particular issues. Notice to the public and people of interest of Special Board Meetings, including the purpose, must be at least seven days in advance and must identify the topics on the agenda. The board can only discuss and make decisions at Special Board Meetings on the topics on the agenda.", indent=8)
    pdf.add_paragraph("C. Emergency Board Meetings: The President or a majority of the board may call an emergency meeting of the board when there is insufficient time to address timely business within the notice requirements of a regular or special meeting. Notice to all board members of an Emergency Board Meeting, including the purpose, may not be less than 24 hours in advance. Direct notice to individuals known to have an interest in a particular agenda item must be provided. Meeting minutes must describe the circumstances requiring an emergency meeting.", indent=8)

    pdf.add_subheading("Section 3: Executive Sessions")
    pdf.add_paragraph("Executive Sessions are when all or part of BWNA Board Meetings are closed to certain persons, but only for deliberation on matters stipulated by the city's Standards for Neighborhood Associations, such as legal consultations or mediation sessions.")

    pdf.add_subheading("Section 4: Agenda")
    pdf.add_paragraph("The President, Vice President or committee chair will prepare and communicate an agenda for all meetings prior to the meeting. Any person may request that an item be added to the agenda by submitting the item in writing to the person responsible for the agenda. The person responsible for an agenda may establish a cutoff time requirement for submitting agenda items. The cutoff time requirement shall not exceed 14 days before the meeting.")

    pdf.add_subheading("Section 5: Minutes")
    pdf.add_paragraph("Minutes of all BWNA Board and Membership Meetings shall be retained by the secretary and available for inspection within ten days following any meeting. The secretary will send minutes to the BWNA DC within one week of approval.")

    pdf.add_subheading("Section 6: Quorum")
    pdf.add_paragraph("A quorum for any kind of BWNA meeting shall be a majority of the currently serving board members. A quorum is required for any action at any meeting.")

    pdf.add_subheading("Section 7: Participation")
    pdf.add_paragraph("Any kind of BWNA meeting is open to all people who wish to attend and be heard; however, only Beaumont-Wilshire neighborhood residents are entitled to vote according to the protocols outlined in Article 3, Section 2 above. All actions or recommendations taken will be communicated to all affected parties, including minority reports. The chair of any meeting controls the extent of public participation. BWNA is not required to allow public participation in board or committee meetings, although the public is allowed to be present.")

    pdf.add_subheading("Section 8: Presentations and Positions")
    pdf.add_paragraph("As part of the mission of providing opportunities for Beaumont-Wilshire residents to examine local issues, the board may arrange for presentations at meetings by political candidates and proponents of ballot measures and other political and legislative issues that affect the neighborhood. Every effort must be made to ensure that all candidates and points of view are represented in any such forum.")
    pdf.add_paragraph("In accord with City of Portland standards for Neighborhood Associations, BWNA cannot take positions in support of or in opposition to any political candidate or party. However, the organization may take positions on ballot measures, referendums, and other political and legislative issues based on a vote of board members.")

    pdf.add_subheading("Section 9: Procedures")
    pdf.add_paragraph("BWNA generally follows Robert's Rules of Order in all areas not covered by the bylaws.")

    pdf.add_subheading("Section 10: Absence")
    pdf.add_paragraph("Board members must provide notice to at least one other board member, who will be in attendance, that they will not be attending a scheduled meeting. Such notice constitutes an excused absence. Failure to provide notice shall be recorded in the minutes as an unexcused absence.")

    pdf.add_subheading("Section 11: Open Meetings and Public Records Law")
    pdf.add_paragraph("BWNA shall abide by all the requirements relative to public meetings and public records as outlined in the City of Portland's Standards for Neighborhood Associations, including conducting its affairs in meetings open to and with adequate notice to the public. (The exception, as noted and defined in Section 4 above, is Executive Sessions for narrowly defined matters such as legal consultations or mediation sessions.) Voting to render a decision, including a decision on matters considered in Executive Session, must be done in a meeting open to public attendance. Official action(s) taken by the Neighborhood Association must be on record or part of the minutes of each meeting. The minutes shall include a record of attendance and the results of any vote(s) and recommendations made along with a summary of dissenting views. Official records will be kept on file at the BWNA DC office.")

    # Article 7
    pdf.add_heading("ARTICLE 7: DISTRICT COALITION REPRESENTATIVE")
    pdf.add_paragraph("The board will elect representatives to serve on the board of BWNA's DC, and participate and vote in accordance with the DC's bylaws. The board may also elect representatives to serve on the BWNA's DC committee(s). These representatives are expected to attend DC committee meetings they have been elected to.")

    # Article 8
    pdf.add_heading("ARTICLE 8: COMMITTEES")

    pdf.add_subheading("Section 1: Standing Committees")
    pdf.add_paragraph("The board shall establish standing committees as deemed appropriate, establish a general purpose statement for each committee, and designate a committee chair. The chair shall be responsible to provide the board regular updates and report back to the board.")

    pdf.add_subheading("Section 2: Ad Hoc Committees")
    pdf.add_paragraph("The president or the board shall establish ad hoc committees as deemed appropriate and designate a committee chair. The chair shall be responsible to provide the board regular updates and report back to the board. Ad hoc committees shall disband when the purpose for establishing the committee has been accomplished.")

    pdf.add_subheading("Section 3: Committee Recommendations")
    pdf.add_paragraph("Committee recommendations to the board are advisory. Board approval is needed for implementation of a recommendation.")

    # Article 9
    pdf.add_heading("ARTICLE 9: ELECTIONS")

    pdf.add_subheading("Section 1: Eligibility")
    pdf.add_paragraph("Any member shall be qualified to hold an elected or appointed position.")

    pdf.add_subheading("Section 2: At-Large Board Members")
    pdf.add_paragraph("At-large members of the board shall be elected to serve for two years at the Annual Meeting. The election shall be by nomination from the floor and requires a majority vote of the membership present.")

    pdf.add_subheading("Section 3: Officers")
    pdf.add_paragraph("Officers shall be elected to serve for two years at the Annual Meeting. The election shall be by nomination from the floor and requires a majority vote of the membership present.")

    pdf.add_subheading("Section 4: Removal from Office")
    pdf.add_paragraph("Any holder of an elected position may be removed and replaced by a two-thirds vote of the membership present at a General, Special, or Emergency Meeting.")

    # Article 10
    pdf.add_heading("ARTICLE 10: GRIEVANCE PROCEDURE")

    pdf.add_subheading("Section 1: One-on-One Dialogue and Mediation")
    pdf.add_paragraph("Individuals and groups are encouraged to reconcile differences, whether inside or outside the scope of these grievance procedures, through one-on-one dialogue or mediation.")

    pdf.add_subheading("Section 2: Eligibility to Grieve")
    pdf.add_paragraph("Any person or group may initiate this grievance procedure by submitting a grievance in writing to the Board. Grievances are limited to complaints that the grievant has been harmed by a violation of City of Portland Standards for Neighborhood Associations or these bylaws that has directly affected the outcome of a decision of the BWNA. Grievances must be submitted within 45 business days of the alleged violation.")

    pdf.add_subheading("Section 3: Processing the Grievance")
    pdf.add_paragraph("The Board shall arrange a Grievance Committee, which shall review the grievance. The committee shall hold a public hearing and give the grievant and others wishing to present relevant comment an opportunity to be heard. The committee shall then forward its recommendations to the board.")

    pdf.add_subheading("Section 4: Final Resolution")
    pdf.add_paragraph("Within 60 calendar days from receipt of the grievance, the BWNA shall render a final decision on the grievance and notify the grievant of their decision. Deliberations by the grievance committee on a recommendation and by the board on a decision may be held in Executive Session. The findings shall be a matter of public record.")

    # Article 11
    pdf.add_heading("ARTICLE 11: PROCEDURE FOR CONSIDERATION OF PROPOSALS")

    pdf.add_subheading("Section 1: Execution")
    pdf.add_paragraph("The board shall be responsible for the execution of this article.")

    pdf.add_subheading("Section 2: Submission of Proposals")
    pdf.add_paragraph("Any person or group, inside or outside the boundaries of BWNA, and any city agency may propose in writing items for consideration and/or recommendation to the board. The board shall decide whether proposed items will appear on the agenda of either a Board, General, Emergency, or Special Meeting. A majority vote of the board is required to add a proposed item to a meeting agenda.")

    pdf.add_subheading("Section 3: Notification")
    pdf.add_paragraph("The proponent and members directly affected by such proposals shall be notified in writing not less than seven days in advance of the place, day, and hour when the proposal shall be reviewed.")

    pdf.add_subheading("Section 4: Attendance")
    pdf.add_paragraph("The proponent may attend the meeting to make a presentation and answer questions concerning the proposal.")

    pdf.add_subheading("Section 5: Dissemination")
    pdf.add_paragraph("BWNA shall submit recommendations and dissenting views as recorded from the meeting to the proponent and other appropriate parties.")

    # Article 12
    pdf.add_heading("ARTICLE 12: AMENDMENTS")
    pdf.add_paragraph("Any proposed amendment to the bylaws shall be, at a minimum, summarized and included in a written notice before the General or Special Meeting at which it will be considered. The full text, existing and proposed, shall be made available. A two-thirds majority vote of the members present at said meeting is required to amend the bylaws.")

    # Article 13
    pdf.add_heading("ARTICLE 13: DISSOLUTION")

    pdf.add_subheading("Section 1: Method")
    pdf.add_paragraph("The question of the dissolution of BWNA shall be considered at a General Meeting following advance written notice to the membership. A 75 percent majority vote of the members present at the meeting is required to dissolve BWNA.")

    pdf.add_subheading("Section 2: Records and Funds")
    pdf.add_paragraph("Upon dissolution of BWNA all records and bookkeeping materials are to go to the responsible BWNA DC, and funds are to go to charitable, educational, or civic improvement efforts related to or located within the BWNA boundaries described in these bylaws. This disbursement will be approved by a majority vote of the board and is the final action of the board.")

    pdf.output("public/documents/bwna-bylaws.pdf")
    print(f"Bylaws PDF: {pdf.pages_count} pages")


# Superseded: the policies PDF is now authored by Jane in InDesign and lives at
# public/documents/bwna-policies.pdf. Running this would overwrite it with the
# older text scraped from the Wix site. Kept for reference only.
def generate_policies():
    pdf = BWNADocument()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    pdf.add_title("BWNA Policy Statement")
    pdf.add_subtitle("These policies are subject to change at any time by majority vote of the Board.")

    pdf.add_heading("MEETING AGENDA CONTENT")

    policies = [
        '1) Priority is given to agenda items related to Beaumont-Wilshire & vicinity, BWNA per se, and the neighborhood association system in general. This priority policy also applies to guest speakers at monthly meetings and BWNA Newsletter content. Guest speakers may include incumbent officeholders, but in the case of political candidates and/or ballot measure advocates, if one is invited, then competitors are invited, too.',
        '2) The agenda may include proposed policy resolutions, be they internal to BWNA or external in support of a policy affecting not only Beaumont-Wilshire residents, but residents in other neighborhoods as well. Political endorsements are off limits.',
        '3) The agenda may include a proposed Good Neighbor Agreement with a business within Beaumont-Wilshire boundaries, the purpose of which is to establish and implement mutually agreed upon expectations for the good of the neighborhood. Signed by the BBA President and the owner of the business, compliance is voluntary.',
        '4) The President disseminates a proposed agenda draft to the Board via e-mail, providing members adequate time for feedback and suggested revisions. The final draft is disseminated to the community via the BWNA website and social media no later than a week prior to the meeting. At the meeting, Board members have an opportunity to request inclusion of additional agenda items prior to approval vote.',
    ]
    for p in policies:
        pdf.add_paragraph(p, indent=8)

    pdf.add_heading("CONDUCTING OF MEETINGS")

    pdf.add_paragraph("1) In the event that the President, Vice President, and Immediate Past President are unable to attend a Board, General, or Special Meeting, an At-Large Board Member volunteer is approved by the Board to chair the meeting. In the absence of the Secretary, an At-Large Board Member volunteer is approved by the Board to take meeting minutes. In the absence of the Treasurer at a Board or General Meeting, the Chair presents the Treasurer's Report based on data submitted by the Treasurer.", indent=8)

    pdf.add_paragraph("2) The Chair conducts meetings via the following simplified Robert's Rules of Order:", indent=8)

    rules = [
        'a) Upon a motion made by a Board member, the Chair asks if there is a second to the motion by another Board member. Without a second, the motion dies. If there is a second, the Chair opens the motion for discussion, then to a vote by the Board.',
        'b) A Board member may request that discussion be ended and a vote be taken by simply saying "Question". The Chair then asks for a Board vote on the request. If a majority is not in favor, discussion continues. Time constraints may require the Chair to unilaterally end discussion and proceed to a vote (or to table the matter).',
        'c) A Board member may offer an amendment to a motion. If the person who made the motion agrees to the amendment, then discussion proceeds on the motion as amended. If the person who made the motion does not agree to the amendment, discussion commences on the proposed amendment, then to a vote. If the amendment passes, discussion proceeds on the motion as amended, then to a vote.',
        'd) At any time during the meeting a Board member may ask the Chair for clarification on meeting content or procedure by saying "Point of Information".',
        'e) The Chair decides if voting is to be by hands raised or by voice (ayes, nays).',
        u'f) The Chair is responsible for maintaining meeting decorum\u2014i.e., hands raised to participate, discourse respectfully civil. Due to time constraints and number of participants, the Chair may opt to set a time limit per comment/question or may opt to direct participants to submit comments/questions in writing addressed to the Board and/or guest speaker (submissions read aloud by the Chair as time permits).',
    ]
    for r in rules:
        pdf.add_paragraph(r, indent=16)

    pdf.output("public/documents/bwna-policies.pdf")
    print(f"Policies PDF: {pdf.pages_count} pages")


if __name__ == "__main__":
    generate_bylaws()
    # generate_policies()  # see note above -- would clobber Jane's InDesign PDF
    print("Done!")
