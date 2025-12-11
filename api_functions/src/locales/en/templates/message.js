module.exports = {
  'template-emailAlreadyExists-subject-1634979920823':
    'Looks like you already have an account',
  'template-emailAlreadyExists-body-1634979963140': `
  <p> 
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hello [FIRST_NAME],
      <br/><br/> 
      We couldn't create a new pave account as it looks like you already have an account with your email address. 
      <br/><br/>
      You can log in to your account or reset password if you need to here:
      <a href="[LOGIN_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Login</a>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
      <br/><br/>
      If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
  `,

  'template-emailVerification-subject-1601338955192': 'Pave Email Verification',
  'template-emailVerification-body-1601338955192': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			Thank you for signing up with Pave.
			<br/><br/>
			To complete the sign up process, please click the button below:
			<br/><br/>
			<a href="[EMAIL_VERIFICATION_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Confirm email</a>
			<br/><br/>
			Or copy and paste this URL into a new tab of your browser:
			<br/>
			<a href="[EMAIL_VERIFICATION_URL]">[EMAIL_VERIFICATION_URL]</a>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
			<br/><br/>
			If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.

		</p>
	`,
  'template-resetPassword-subject-1613818392997': 'Pave Forgotten Password',
  'template-resetPassword-body-1613818392997': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			There has been a request to reset your password to access Pave. However, given your account was created using Google Sign-in, you will need to use that to sign in again.
			<br/><br/>
			<a href="[LOGIN_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Login</a>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
			<br/><br/>
			If you didn't make this request, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.

		</p>
	`,
  'template-resetPassword-subject-1613806012993': 'Pave Forgotten Password',
  'template-resetPassword-body-1613806012993': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			There has been a request to reset your password for Pave.
			<br/><br/>
			To complete the reset password process, please click the button below:
			<br/><br/>
			<a href="[RESET_PASSWORD_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Reset password</a>
			<br/><br/>
			Or copy and paste this URL into a new tab of your browser:
			<br/>
			<a href="[RESET_PASSWORD_URL]">[RESET_PASSWORD_URL]</a>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
			<br/><br/>
			If you didn't make this request, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
		</p>
	`,
  'template-resetPassword-subject-1613806153934': 'Pave Password Changed',
  'template-resetPassword-body-1613806153934': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			Your Pave password has recently changed.
			<br/><br/>
			If you didn't make this request, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
		</p>
	`,

  'template-commentPosted-subject-1624117067': `You've received a comment on your property from [CONTACT_NAME]`,
  'template-commentPosted-body-1624116886': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [AGENT_FIRST_NAME],
			<br/><br/>
			[CONTACT_NAME] has commented on your property!
			<br/><br/>
			<b>Property name</b>: [PROPERTY_NAME]
			<br/>
      <div style="width: 90%; background-color: #eff2f6; border-radius: 10px; padding: 10px 15px; margin: 10px 0px;">[MESSAGE]</div>
			<br/>
			<a href="[COMMENT_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Reply</a>            
			<br/><br/>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,

  'template-commentPosted-subject-1624117268': 'Pave Message from Agent',
  'template-commentPosted-body-1624117278': `
		<p>
<!--			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>-->
      <br/><br/>
			Hello [BUYER_FIRST_NAME],
			<br/><br/>
			You've received a new message from [AGENT_FIRST_NAME] from [AGENCY_NAME] as follows:
			<br/><br/>
			[PROPERTY_NAME]
			<br/><br/>
			[MESSAGE]
			<br/><br/>
			<a href="[COMMENT_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Reply</a>            
			<br/><br/>
			Best wishes,
			<br/>
			The Chaaat Team 
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,

  'template-shortlisted-property-subject-1624117469':
    'Pave Shortlisted Properties for review',
  'template-shortlisted-property-body-1624117475': `
		<p>
<!--			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>-->
      <br/><br/>
			Hi [BUYER_FIRST_NAME],
			<br/><br/>
			You've received a shortlist of properties to review from [AGENT_FIRST_NAME] from [AGENCY_NAME]:
			<br/><br/>
			Please click on the following link to review a wide range of information about the properties and also provide us any thoughts or comments you may have.
			<br/><br/>
			<a href="[PERMALINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">View Proposal</a>            
			<br/><br/>
			Or copy and paste this URL into a new tab of your browser:
			<br/>
			<a href="[PERMALINK]">[PERMALINK]</a>
			<br/><br/>
			Best wishes, 
			<br/>
			The Chaaat Team
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,
  'template-shortlisted-property-body-email-integration-1624117475': `
			Hi [BUYER_FIRST_NAME],

			You've received a shortlist of properties to review from [AGENT_FIRST_NAME] from [AGENCY_NAME].
			Please click on the following link to review a wide range of information about the properties and also provide us any thoughts or comments you may have.
			[PERMALINK]

	`,

  'template-invite-user-subject-1632282919050': `[USER_WHO_IS_INVITING] has invited you to join the [AGENCY_NAME] team at Pave!`,
  'template-invite-user-body-1632283174576': `
        <p>
   		     	<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
            <br/><br/>
            Welcome [INVITED_USER_NAME], 
            <br/><br/>
            [USER_WHO_IS_INVITING] has invited you to join Pave.
            <br/><br/>
            <a href="[SIGNUP_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Activate my account</a>            
            <br/><br/>
            Happy Selling!
            <br/>
            The Chaaat Team
            <br/><br/>
            Please note this is an automatically generated email and is not monitored for replies.
        </p>
    `,

  'template-buyer-activity-link-opened-email-subject-1639636972368': `Your Pave Proposal has been opened by [CONTACT_NAME]!`,
  'template-buyer-activity-link-opened-email-body-1639636982147': `
  <p>
		<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENT_NAME],
    <br/><br/>
    Your Pave Web Link was opened for the first time by [CONTACT_NAME]!
    <br/><br/>
    <a href="[ACTIVITY_STREAM_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;"> See more insights
    </a>
    <br/><br/>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>
`,
  'template-buyer-activity-property-rated-email-subject-1640063289002': `Your property has been rated by [CONTACT_NAME]!`,
  'template-buyer-activity-property-rated-email-body-1639636982147': `
  <p>
		<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENT_NAME],
    <br/><br/>
    [CONTACT_NAME] has rated a property!
    <br/><br/>
    <b>Property name</b>: [PROPERTY_NAME]
    <br/> 
    <b>Previous rating</b>: [PREVIOUS_RATING]
    <br/>
    <b>New rating</b>: [NEW_RATING]
    <br/><br/>
    <a href="[ACTIVITY_STREAM_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">See more insights</a>
    <br/><br/>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>
`,
  'template-3-minute-buyer-activity-summary-email-subject-1647832776541': `[CONTACT_NAME] has viewed your proposal.`,
  'template-3-minute-buyer-activity-summary-email-front-body-1647832776541': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_NAME],
    <br/><br/>
    [CONTACT_NAME] has viewed your proposal.
    <br/><br/>
    <div style="width: 80%">
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px; display:flex;">
            <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Viewed From:</span>
            <span style="width: 49%; display: inline-block; text-align:right">[ACTIVITY_LOCATION]</span>
        </div>
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
            <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Viewed On:</span>
            <span style="width: 49%; display: inline-block; text-align:right">[ACTIVITY_DEVICE]</span>
        </div>
    </div>
    <br/>
  `,
  'template-3-minute-buyer-activity-summary-email-project-1648622679295': `
  <h3>[PROJECT_NAME]</h3>
  <div style="width: 80%">
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Key Stats:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[KEY_STATS]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Project Highlights:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[PROJECT_HIGHLIGHTS]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Why Invest:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[WHY_INVEST]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Shopping:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[SHOPPING]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Transport:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[TRANSPORT]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Education:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[EDUCATION]</span>
      </div>
      <br/>
      <img src="[PIE_CHART_URL]" width="500"/>
  </div>
`,
  'template-3-minute-buyer-activity-summary-email-project-start-1652660954105': `
  <h3>[PROJECT_NAME]</h3>
  <div style="width: 80%">
`,
  'template-3-minute-buyer-activity-summary-email-project-project-field-row-1652660954105': `
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">[PROJECT_DETAIL_TITLE]</span>
          <span style="width: 49%; display: inline-block; text-align:right">[PROJECT_DETAIL_CONTENT]</span>
      </div>
`,

  'template-3-minute-buyer-activity-summary-email-project-end-1652660954105': `
      <div style="font-weight: bold; font-size: 14px; padding-top: 5px;">Time spent on media types (seconds): </div>
      <img src="[PIE_CHART_URL]" width="500"/>
  </div>
`,
  'template-3-minute-buyer-activity-summary-email-property-1648622679295': `
    <h3>[PROPERTY_NAME]</h3>
    <div style="width: 80%">
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
            <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Rating:</span>
            <span style="width: 49%; display: inline-block; text-align:right">[RATING]</span>
        </div>
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
            <span style="font-weight: bold;">Latest comment:</span>
            <div style="width: 90%; background-color: #eff2f6; border-radius: 10px; padding: 10px 15px; margin: 10px 0px;">[COMMENT]</div>
        </div>
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
            <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Overall time:</span>
            <span style="width: 49%; display: inline-block; text-align:right">[OVERALL_TIME]</span>
        </div>
        <div style="font-weight: bold; font-size: 14px; padding-top: 5px;">Time spent on media types (seconds): </div>
        <img src="[PIE_CHART_URL]" width="500"/>
    </div>
  `,
  'template-3-minute-buyer-activity-summary-email-end-body-1648620473739': `
    </div>  
    <br/><br/>
    <a href="[ACTIVITY_STREAM_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">View more insights</a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </div>
  `,
  'template-enquire-project-email-subject-1650435889233': `[CONTACT_NAME] has enquired a project`,
  'template-enquire-project-email-body-1650435889233': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    You've received an enquiry for [PROJECT_NAME] from [BUYER_FIRST_NAME].
    <br/><br/>
    Next step? Get in touch to understand a little more around what they would like to see and then add some options for them via the following link. Good luck!
    <br/><br/>
    <br/><br/>
    <a href="[CREATE_LINK_WIZARD]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Add Properties</a>            
    <br/><br/>
    Or copy and paste this URL into a new tab of your browser:
    <br/>
    <a href="[CREATE_LINK_WIZARD]">[CREATE_LINK_WIZARD]</a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>
  `,
  'template-request-reserve-email-subject-1651855722401': `[CONTACT_NAME] has requested to reserve a property`,
  'template-request-reserve-email-body-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    You've received a request to reserve [PROPERTY_NAME] from [BUYER_FIRST_NAME].
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>
  `,
  'template-request-contact-assignment-email-subject-1655190776633': `A new lead, [CONTACT_NAME] is ready to be sent a proposal!`,
  'template-request-contact-assignment-email-body-1655190776633': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
	  <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
	  Hi [AGENT_NAME],
	  <br/><br/>
	  A new lead, [CONTACT_NAME] is ready to be sent a proposal! 
	  <br/><br/>
	  Next step? Click on the button below or head to the Pave portal to create a proposal for the contact.
    <br/><br/>
	  <a href="[CREATE_PROPOSAL_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Create Proposal</a>
	  <br/><br/>
	  Happy Selling!
	  <br/>
	  The Chaaat Team
	  <br/><br/>
	  Please note this is an automatically generated email and is not monitored for replies.
  </div>
  `,
  'template-weekly-proposal-report-email-subject-1660140062': `[AGENCY_NAME] Activity Report [DATE_RANGE_STRING]`,
  'template-weekly-proposal-report-email-body-1-1660140062': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
  <br/><br/>
    Hi [AGENT_NAME],
    <br/><br/>
    Here is your weekly summary of activity (Monday - Sunday)
    <br/><br/>
    <b>Total Number of Proposals Sent</b>
    <br/><br/>
    [TOTAL_PROPOSAL_SENT]
    <br/><br/>
    <b>Most Active Agents</b>
    <br/><br/>
    [TOP_1_AGENT_AND_SCORE]
    <br/><br/>
    [TOP_2_AGENT_AND_SCORE]
    <br/><br/>
    <b>Most Active Projects</b>
    <br/><br/>
    [TOP_1_PROJECT_AND_SCORE]
    <br/><br/>
    [TOP_2_PROJECT_AND_SCORE]
  <br/><br/>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </div>
  `,
  'template-weekly-proposal-report-email-body-v2-1-1660140062': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    [CONTENT]
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </div>
  `,
  'template-weekly-proposal-report-email-body-2-1660140062': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
      Hi [AGENT_NAME],
      <br/><br/>
      Here is your weekly summary of activity (Monday - Sunday)
      <br/><br/>
      <b>Total Number of Proposals Sent</b>
      <br/><br/>
      [TOTAL_PROPOSAL_SENT]
      <br/><br/>
      <b>Most Active Projects</b>
      <br/><br/>
      [TOP_1_PROJECT_AND_SCORE]
      <br/><br/>
      [TOP_2_PROJECT_AND_SCORE]
    <br/><br/>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
  </div>
  `,
  '1-generic-001': 'Processed request successfully.',
  '1-generic-1618368927': 'Check for Google email successful.',
  '2-generic-001': 'Sorry, failed to process request. Please try again.',
  '2-generic-002': 'Sorry, you do not have permissions to access this.',
  '2-generic-1618368937': 'Failed to check for Google email.',

  '1-auth-1609072620884': 'Registration successfully.',
  '1-auth-1609072638120': 'Auth type is not supported yet.',
  '1-auth-1608395416607': 'Email verified successfully.',
  '1-auth-1608509359974': 'Login successfully.',
  '1-auth-1609231224034': 'Existing session found, logging in automatically.',
  '1-auth-1613802495917': 'Reset password details sent to email.',
  '1-auth-1613807356033': 'Retrieved user reset password record successfully.',
  '1-auth-1613807437254': 'Reset password successfully.',
  '1-auth-1635225686340': 'Checked access level successfully.',
  '2-auth-1608395441003': 'Sorry, failed to verify email.',
  '2-auth-1608484145842': 'Email has already been verified before.',
  '2-auth-1608510138480': 'Invalid email or password provided.',
  '2-auth-1619409641134': 'Failed to find user account via Google',
  '2-auth-1619409815992': 'Failed to find user account via Facebook',
  '2-auth-1635225659042': 'Failed to check access level.',

  '1-invite-1632188699067': 'User successfully invited.',
  '2-invite-1632188688485': 'Invited user has already registered.',
  '2-invite-1632202462400': 'Failed to retrieve agency users',
  '2-invite-1632202548228': 'Failed to invite user',
  '2-invite-1632350856723':
    'Maximum subscriptions used, please upgrade your account',
  '2-invite-1632352801442': 'User has already been invited',
  '2-invite-1632455283573': 'Invalid invite Id',
  '2-invite-1632456074066':
    'Invalid invite, please check the latest invite email',

  '1-agency-1622176002': 'Retrieved list of agencies successfully.',
  '1-agency-1622176515': 'Retrieved agency record successfully.',
  '1-agency-1622178043': 'Agency record created successfully.',
  '1-agency-1622181696': 'Agency record updated successfully.',
  '1-agency-1622182797': 'Agency record deleted successfully.',
  '1-agency-1622192413': 'Retrieved custom properties of agency successfully',
  '2-agency-1622176015': 'Failed to retrieve list of agencies.',
  '2-agency-1622176528': 'Failed to retrieve agency record.',
  '2-agency-1622178049': 'Failed to create agency record.',
  '2-agency-1622181716': 'Failed to update agency record.',
  '2-agency-1622182815': 'Failed to delete agency record.',
  '2-agency-1622192413': 'Failed to retrieve custom properties of agency',

  '1-agency-user-1622184342': 'Retrieved list of agency users successfully.',
  '1-agency-user-1622184418': 'Retrieved agency user record successfully.',
  '1-agency-user-1622184423': 'Agency User record created successfully.',
  '1-agency-user-1622184438': 'Agency User record updated successfully.',
  '1-agency-user-1622184454': 'Agency User record deleted successfully.',
  '1-agency-user-1623401085':
    'Agency User Profile record updated successfully.',
  '2-agency-user-1622184349': 'Failed to retrieve list of agency users.',
  '2-agency-user-1622184497': 'Failed to retrieve agency users record.',
  '2-agency-user-1622184515': 'Failed to create agency users record.',
  '2-agency-user-1622184520': 'Failed to update agency users record.',
  '2-agency-user-1622184526': 'Failed to update agency users record.',
  '2-agency-user-1622184530': 'Failed to delete agency users record.',
  '2-agency-user-1623401116': 'Failed to update agency user profile record.',

  '1-dashboard-1622276213': 'Retrieved dashboard statistics successfully.',
  '2-dashboard-1622276249': 'Failed to retrieve dashboard statistics.',

  '1-property-1609297168630': 'Added property successfully.',
  '1-property-1609299204368': 'Updated property successfully.',
  '1-property-1609479971845': 'Retrieved properties successfully.',
  '1-property-1609589212033': 'Retrieved property successfully.',
  '2-property-1609297207447': 'Failed to add property.',
  '2-property-1609299218003': 'Failed to update property.',
  '2-property-1609479951154': 'Failed to get properties.',

  '1-task-1610880791311': 'Retrieved tasks successfully.',
  '1-task-1610587170835': 'Added task successfully.',
  '1-task-1610672817713': 'Retrieved task successfully.',
  '1-task-1611375816784': 'Sent task message successfully.',
  '1-task-1611505237506': 'Completed task successfully.',
  '1-task-1611505711318': 'Restored task successfully.',
  '2-task-1610880838338': 'Failed to retrieve tasks.',
  '2-task-1610587240262': 'Failed to add task.',
  '2-task-1610672848565': 'Failed to retrieve task.',
  '2-task-1611375834526': 'Failed to send task message.',
  '2-task-1611505259663': 'Failed to complete task.',
  '2-task-1611505727549': 'Failed to restore task.',

  '1-user-saved-property-1617786003': 'User saved property successfully.',
  '1-user-saved-property-1617786876': 'User un-saved property successfully',
  '1-user-saved-property-1617982186':
    'Retrieved user saved properties successfully.',
  '1-user-saved-property-1618755411':
    'Retrieved user saved property successfully.',
  '2-user-saved-property-1617786084': 'User failed to save property.',
  '2-user-saved-property-1618908991':
    'User saved property record already exist',
  '2-user-saved-property-1617786928': 'User failed to un-save property.',
  '2-user-saved-property-1617982207':
    'Failed to retrieve user saved properties.',
  '2-user-saved-property-1618755441': 'Failed to retrieve user saved property.',

  '1-user-management-delete-user-1652068512231':
    'User was successfully deleted.',
  '2-user-management-delete-user-1652068512231': 'Faield to delete user.',

  '1-contact-1620396460': 'Contact created successfully.',
  '1-contact-1620800584': 'Successfully shortlisted property to contact.',
  '1-contact-1621560037508':
    'Retrieved contact with shortlisted properties successfully.',
  '1-contact-1621772306': 'Contact updated successfully.',
  '1-contact-1622566911583': 'Contact deleted successfully.',
  '1-contact-1652766684694': 'Contacts deleted successfully.',
  '1-contact-1621773084': 'Contacts list retrieved successfully.',
  '1-contact-1621773321': 'Contact retrieved successfully.',
  '2-contact-1620396470': 'Failed to create contact.',
  '2-contact-1621771554': 'Contact record already exist.',
  '2-contact-1620800740':
    'Contact and shortlisted property record already exist.',
  '2-contact-1621560006601':
    'Failed to retrieve contact with shortlisted properties.',
  '2-contact-1621772321': 'Failed to update contact.',
  '2-contact-1622566930484': 'Failed to delete contact.',
  '2-contact-1652766684694': 'Failed to delete contacts.',
  '2-contact-1621773105': 'Failed to retrieve list of contacts.',
  '2-contact-1621773339': 'Failed to retrieve contact.',
  '2-contact-1630304759': 'No contact tied to inactive permalink',

  '1-contactLink-1622566911583': 'Deleted contact Link successfully.',
  '1-contactLink-1621773084': 'Retrieved contact links successfully.',
  '1-contactLink-1621772306': 'Created contact Link successfully.',
  '1-contactLink-1624469170895': 'Updated contact Link successfully.',
  '1-contactLink-1623032712200':
    'Retrieved list of possible duplicate contact links successfully.',
  '1-contactLink-1634074635889': 'Retrieved email template successfully.',
  '1-contactLink-1637887186363': 'Sent email to contact successfully.',
  '2-contactLink-1622566930484': 'Failed to delete contact Link.',
  '2-contactLink-1621773105': 'Failed to retrieve contact links.',
  '2-contactLink-1621772321': 'Failed to create contact Link.',
  '2-contactLink-1624469211980': 'Failed to update contact Link.',
  '2-contactLink-1623032742565':
    'Failed to retrieve list of possible duplicate contact links.',

  '1-contact-activity-1623812368': 'Successfully created contact activity.',
  '1-contact-activity-1623818234': 'Successfully retrieved contact activities.',
  '1-contact-activity-1652073666416': 'Successfully updated contact activities',
  '2-contact-activity-1623812377': 'Failed to create contact activity.',
  '2-contact-activity-1623818245': 'Failed to retrieve contact activities.',
  '2-contact-activity-1652073666416': 'Failed to updated contact activities',

  '1-shortlisted-property-1621349511': 'Shortlist property successful.',
  '1-shortlisted-property-1621391826':
    'Shortlisted property rated successfully.',
  '2-shortlisted-property-1621349572': 'Failed to shortlist property.',
  '2-shortlisted-property-1621349599': 'Shortlisted property already exist.',
  '2-shortlisted-property-1621391818': 'Failed to rate shortlist property.',
  '2-shortlisted-property-1621756437079':
    'Invalid property rating range provided.',

  '1-shortlisted-project-1649653728340': 'Shortlisted project bookmarked.',
  '2-shortlisted-project-1649653728340':
    'Failed to bookmark shortlisted project',
  '1-shortlisted-project-1649654526107': 'Shortlisted project enquired.',
  '2-shortlisted-project-1649654526107':
    'Failed to enquire shortlisted project',

  '1-shortlisted-property-1643608849564': 'Shorlisted property bookmarked.',
  '2-shortlisted-property-1643608849564':
    'Failed to bookmark shortlisted property.',

  '1-shortlisted-property-1651855722401':
    'Shortlisted property reservation requested.',
  '2-shortlisted-property-1651855722401':
    'Failed to request a reserve a shortlisted property',

  '1-shortlisted-property-comment-1641367796741':
    'Comment deleted successfully',
  '2-shortlisted-property-comment-1641367861046': 'Failed to delete comment',

  '1-shortlisted-property-comment-1621785761283':
    'Created comment successfully.',
  '2-shortlisted-property-comment-1621785808783': 'Failed to create comment.',

  '1-shortlisted-property-comment-1624292423648':
    'Created comment successfully but unit does not exist anymore so no email notifications will be sent to anyone.',
  '1-shortlisted-property-comment-1621787533608':
    'Retrieved comments successfully.',

  '2-shortlisted-property-comment-1621787545586':
    'Failed to retrieve comments.',

  '1-shortlisted-property-comment-reaction-1623147669':
    'Comment reaction created successfully.',
  '2-shortlisted-property-comment-reaction-1623147688':
    'Failed to create comment reaction.',

  '1-comment-1621355838': 'Comment created successfully.',
  '2-comment-1621355844': 'Failed to create comment.',

  '1-file-1620451489206': 'Uploaded file successfully.',

  '1-project-1622567760843': 'Retrieved projects successfully.',
  '1-project-1624940640': 'Retrieved project successfully.',
  '1-project-1624941319': 'Successfully created project.',
  '1-project-1624941807': 'Successfully updated project.',
  '1-project-1624942940': 'Successfully deleted project.',
  '1-project-1626585007395': 'Generated project ID successfully.',
  '2-project-1622567775252': 'Failed to retrieve projects.',
  '2-project-1624940653': 'Failed to retrieve project.',
  '2-project-1624941331': 'Failed to create project.',
  '2-project-1624941870': 'Failed to update project.',
  '2-project-1624942956': 'Failed to delete project.',
  '2-project-1626584979489': 'Failed to generate project ID.',

  '1-project-setting-1653901822616':
    'Successfully created/updated project setting.',
  '2-project-setting-1653901822616':
    'Failed to created/updated project setting.',

  '1-project-setting-1653901822716': 'Successfully retrieve project setting.',
  '2-project-setting-1653901822716': 'Failed to retrieve project setting.',

  '1-project-feature-1625648595': 'Retrieve project features successfully.',
  '1-project-feature-1625648492': 'Create project feature successfully.',
  '2-project-feature-1625648615': 'Failed to retrieve project features.',
  '2-project-feature-1625648559': 'Failed to create project feature.',

  '1-project-property-1624960955': 'Retrieved project properties successfully.',
  '1-project-property-1624940124': 'Retrieved project property successfully.',
  '1-project-property-1624960986': 'Successfully created project property.',
  '1-project-property-1624942165': 'Successfully updated project property.',
  '1-project-property-1624942113': 'Successfully deleted project property.',
  '2-project-property-1622569890': 'Failed to retrieve project properties.',
  '2-project-property-1624966512': 'Failed to retrieve project property.',
  '2-project-property-1624990763': 'Failed to create project property.',
  '2-project-property-1624941443': 'Failed to update project property.',
  '2-project-property-1624940980': 'Failed to delete project property.',

  '1-report-1641514119142': 'Generated report successfully.',
  '1-report-1641516256194': 'Retrieved reports successfully.',
  '1-report-1641516256234': 'Sucessfully deleted report.',
  '2-report-1641514119152': 'Failed to generate report.',
  '2-report-1641516256194': 'Failed to retrieve reports.',
  '2-report-1641516256234': 'Failed to delete report.',

  '1-download-1642525751554': 'Downloaded file successfully.',
  '2-download-1642525751556': 'Failed to download file.',

  //  Contact views
  '1-save-view-success-1644979673273': 'Saved view successfully',
  '2-save-view-failed-1644979675411': 'Failed to save view',
  '1-get-all-contact-views-success-1644979676127':
    'Successfully retrieved all contact views',
  '2-get-all-contact-views-failed-1644979676726': 'Unable to get all contacts',
  '1-delete-contact-view-success-1644979677558':
    'Contact view deleted successfully',
  '2-delete-contact-view-failed-1644979678952': 'Failed to delete contact view',
  '2-user-permission-denied-1644979848480':
    'User does not have permission to edit contact view ',

  // Temp 360 property emails
  '360-property-email-1-hampton-bay-subject': 'Hampton Bay',
  '360-property-email-1-hampton-bay-body': `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html>
    <head>
      <!-- Compiled with Bootstrap Email version: 1.3.1 --><meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style type="text/css">
        body,table,td{font-family:Helvetica,Arial,sans-serif !important}.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}*{color:inherit}a[x-apple-data-detectors],u+#body a,#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}img{-ms-interpolation-mode:bicubic}table:not([class^=s-]){font-family:Helvetica,Arial,sans-serif;mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;border-collapse:collapse}table:not([class^=s-]) td{border-spacing:0px;border-collapse:collapse}@media screen and (max-width: 600px){*[class*=s-lg-]>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}}
      </style>
    </head>
    <body class="" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
      <table class="body" valign="top" role="presentation" border="0" cellpadding="0" cellspacing="0" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
        <tbody>
          <tr>
            <td valign="top" style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
              <div class="">
                <div class="">
                  <table class="card-body" role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                      <tr>
                        <td style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"> Hi [FIRST_NAME], </p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Thank you for your enquiry on Hampton Bay.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">We have 3 bed residences from $1.79m and 4 bed residences from $3.49m.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><b>Our display suite is open Saturdays 11am-1pm at 78-80 Orlando Street, Hampton. Alternatively, if you would like to make a private appointment please click here - <a href="[PROJECT_CONTACT_PERSON_CALENDLY]" style="color: #0d6efd;">Hampton Bay</a></b></p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><b>In the meantime, please find attached some information <a href="[PROPOSAL_LINK]" style="color: #0d6efd;">[PROPOSAL_LINK_NAME]</a>.</b></p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Hampton Bay Residences are individually designed by Martin Friedrich Architect and are perfectly nestled between Hampton Street Shops and the Beach.  Hampton Bay is currently under construction and on track for completion April 2023.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[PROJECT_CONTACT_PERSON] will call you shortly to discuss.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">In anticipation of your appointment or our telephone call, are you able to advise what it is you are looking for? Ie. Owner Occupier/Investor, Budget, Number of Bedrooms, Bathrooms, Car Park etc?</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">I look forward to hearing from you.</p>
                          <br>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Thanks</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Kind Regards,</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME]</p>
                          <br>
                          <div>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME_CAPS] | <span class="text-gray-500" style="color: #a0aec0;">[AGENT_TITLE]</span></p>
                            <br>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left"><b>P:</b> +61 3 9644 2600  | <b>M:</b> [AGENT_MOBILE]</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">Melbourne  |  Sydney  |  Brisbane</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">7 Hotham Street, South Melbourne, VIC 3205</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">www.360propertygroup.com.au</p>
                            <div><img class="img" width="300px" src="https://cdn.yourpave.com/agency/ca9cc8a3a376fc3133eb306082af3e4923e9eb45f407603d4ec0e6406aabe2efcfbe95ea7d93eda60a1f3b0086666d98b69b89257beb3dec75eac1306b9766fe.png" alt="360 PROPERTY" style="height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; border-style: none; border-width: 0;"></div>
                            <ul style="list-style-type: none; padding: 0px;">
                              [MEDIA_LINKS]
                            </ul>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><strong><span class="text-danger" style="color: #dc3545;">WE WILL NEVER SEND BANK ACCOUNT DETAILS ONLINE, BY EMAIL OR BY SMS. WE WILL ONLY EVER PROVIDE SUCH DETAILS VERBALLY IN PERSON OR OVER THE PHONE.</span></strong></p>
                            <br>
                            <p class="text-gray-500 text-sm" style="line-height: 16.8px; font-size: 14px; color: #a0aec0; width: 100%; margin: 0;" align="left">Please consider the environment before printing this e-mail This email may contain confidential, copyright and/or privileged information and is intended only for use by the intended recipient. If you are not the intended recipient you must not use, copy or disclose the information in this email. If you have received this email in error please notify the sender immediately by return e-mail, and delete the e-mail and destroy any hard copies of the email. It is your responsibility to check this e-mail for viruses and other defects. Three Sixty Property Group Pty Ltd does not accept any liability for any loss or damage whatsoever and however caused which may result directly or indirectly from this e-mail or any attachments. The views, content and opinions in this e-mail are those of the sender and not necessarily of Three Sixty Property Group Pty Ltd except where this is specifically stated to be the case.</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `,
  '360-property-email-1-orlando-subject': 'Orlando Residences',
  '360-property-email-1-orlando-body': `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html>
    <head>
      <!-- Compiled with Bootstrap Email version: 1.3.1 --><meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style type="text/css">
        body,table,td{font-family:Helvetica,Arial,sans-serif !important}.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}*{color:inherit}a[x-apple-data-detectors],u+#body a,#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}img{-ms-interpolation-mode:bicubic}table:not([class^=s-]){font-family:Helvetica,Arial,sans-serif;mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;border-collapse:collapse}table:not([class^=s-]) td{border-spacing:0px;border-collapse:collapse}@media screen and (max-width: 600px){*[class*=s-lg-]>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}}
      </style>
    </head>
    <body class="" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
      <table class="body" valign="top" role="presentation" border="0" cellpadding="0" cellspacing="0" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
        <tbody>
          <tr>
            <td valign="top" style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
              <div class="">
                <div class="">
                  <table class="card-body" role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                      <tr>
                        <td style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"> Hi [FIRST_NAME], </p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Thank you for your enquiry on Orlando.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">We have 2 bed residences from $1.245m and 3 bed residences from $1.875m.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><b>Our display suite is open Saturdays 11am-1pm at 78-80 Orlando Street, Hampton. Alternatively, if you would like to make a private appointment please click here - <a href="[PROJECT_CONTACT_PERSON_CALENDLY]" style="color: #0d6efd;">Orlando Residences</a></b></p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><b>In the meantime, please find attached some information <a href="[PROPOSAL_LINK]" style="color: #0d6efd;">[PROPOSAL_LINK_NAME]</a>.</b></p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Orlando is a selection of residences, effortlessly stylish, spacious, luxury apartments designed by Roger Boland Architects, with stunning interiors from Design By Golden.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[PROJECT_CONTACT_PERSON] will call you shortly to discuss.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">In anticipation of your appointment or our telephone call, are you able to advise what it is you are looking for? Ie. Owner Occupier/Investor, Budget, Number of Bedrooms, Bathrooms, Car Park etc?</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">I look forward to hearing from you.</p>
                          <br>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Thanks</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Kind Regards,</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME]</p>
                          <br>
                          <div>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME_CAPS] | <span class="text-gray-500" style="color: #a0aec0;">[AGENT_TITLE]</span></p>
                            <br>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left"><b>P:</b> +61 3 9644 2600  | <b>M:</b> [AGENT_MOBILE]</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">Melbourne  |  Sydney  |  Brisbane</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">7 Hotham Street, South Melbourne, VIC 3205</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">www.360propertygroup.com.au</p>
                            <div><img class="img" width="300px" src="https://cdn.yourpave.com/agency/ca9cc8a3a376fc3133eb306082af3e4923e9eb45f407603d4ec0e6406aabe2efcfbe95ea7d93eda60a1f3b0086666d98b69b89257beb3dec75eac1306b9766fe.png" alt="360 PROPERTY" style="height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; border-style: none; border-width: 0;"></div>
                            <ul style="list-style-type: none; padding: 0px;">
                              [MEDIA_LINKS]
                            </ul>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><strong><span class="text-danger" style="color: #dc3545;">WE WILL NEVER SEND BANK ACCOUNT DETAILS ONLINE, BY EMAIL OR BY SMS. WE WILL ONLY EVER PROVIDE SUCH DETAILS VERBALLY IN PERSON OR OVER THE PHONE.</span></strong></p>
                            <br>
                            <p class="text-gray-500 text-sm" style="line-height: 16.8px; font-size: 14px; color: #a0aec0; width: 100%; margin: 0;" align="left">Please consider the environment before printing this e-mail This email may contain confidential, copyright and/or privileged information and is intended only for use by the intended recipient. If you are not the intended recipient you must not use, copy or disclose the information in this email. If you have received this email in error please notify the sender immediately by return e-mail, and delete the e-mail and destroy any hard copies of the email. It is your responsibility to check this e-mail for viruses and other defects. Three Sixty Property Group Pty Ltd does not accept any liability for any loss or damage whatsoever and however caused which may result directly or indirectly from this e-mail or any attachments. The views, content and opinions in this e-mail are those of the sender and not necessarily of Three Sixty Property Group Pty Ltd except where this is specifically stated to be the case.</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `,
  '360-property-email-2-hampton-bay-subject': 'Hampton Bay',
  '360-property-email-2-hampton-bay-body': `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html>
    <head>
      <!-- Compiled with Bootstrap Email version: 1.3.1 --><meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style type="text/css">
        body,table,td{font-family:Helvetica,Arial,sans-serif !important}.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}*{color:inherit}a[x-apple-data-detectors],u+#body a,#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}img{-ms-interpolation-mode:bicubic}table:not([class^=s-]){font-family:Helvetica,Arial,sans-serif;mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;border-collapse:collapse}table:not([class^=s-]) td{border-spacing:0px;border-collapse:collapse}@media screen and (max-width: 600px){*[class*=s-lg-]>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}}
      </style>
    </head>
    <body class="" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
      <table class="body" valign="top" role="presentation" border="0" cellpadding="0" cellspacing="0" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
        <tbody>
          <tr>
            <td valign="top" style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
              <div class="">
                <div class="">
                  <table class="card-body" role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                      <tr>
                        <td style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"> Hi [FIRST_NAME], </p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">I noticed since your enquiry on Hampton Bay you haven&#8217;t been into the Display Suite.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">We would love to see you in there and be able to show you fixtures and fittings and give you more information on this amazing project.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><b>Our display suite is open Saturdays 11am-1pm at 78-80 Orlando Street, Hampton. Alternatively, if you would like to make a private appointment please click here - <a href="[PROJECT_CONTACT_PERSON_CALENDLY]" style="color: #0d6efd;">Hampton Bay</a></b></p>
                          <br>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Kind Regards,</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME]</p>
                          <br>
                          <br>
                          <div>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME_CAPS] | <span class="text-gray-500" style="color: #a0aec0;">[AGENT_TITLE]</span></p>
                            <div><img width="300px" class="img" src="https://cdn.yourpave.com/agency/ca9cc8a3a376fc3133eb306082af3e4923e9eb45f407603d4ec0e6406aabe2efcfbe95ea7d93eda60a1f3b0086666d98b69b89257beb3dec75eac1306b9766fe.png" alt="Some Image" style="height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; border-style: none; border-width: 0;"></div>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left"><b>P:</b> +61 3 9644 2600  | <b>M:</b> [AGENT_MOBILE]</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">Melbourne  |  Sydney  |  Brisbane</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">7 Hotham Street, South Melbourne, VIC 3205</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">www.360propertygroup.com.au</p>
                            <ul style="list-style-type: none; padding: 0px;">
                              [MEDIA_LINKS]
                            </ul>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><strong><span class="text-danger" style="color: #dc3545;">WE WILL NEVER SEND BANK ACCOUNT DETAILS ONLINE, BY EMAIL OR BY SMS. WE WILL ONLY EVER PROVIDE SUCH DETAILS VERBALLY IN PERSON OR OVER THE PHONE.</span></strong></p>
                            <br>
                            <p class="text-gray-500 text-sm" style="line-height: 16.8px; font-size: 14px; color: #a0aec0; width: 100%; margin: 0;" align="left">Please consider the environment before printing this e-mail This email may contain confidential, copyright and/or privileged information and is intended only for use by the intended recipient. If you are not the intended recipient you must not use, copy or disclose the information in this email. If you have received this email in error please notify the sender immediately by return e-mail, and delete the e-mail and destroy any hard copies of the email. It is your responsibility to check this e-mail for viruses and other defects. Three Sixty Property Group Pty Ltd does not accept any liability for any loss or damage whatsoever and however caused which may result directly or indirectly from this e-mail or any attachments. The views, content and opinions in this e-mail are those of the sender and not necessarily of Three Sixty Property Group Pty Ltd except where this is specifically stated to be the case.</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `,
  '360-property-email-2-orlando-subject': 'Orlando Residences',
  '360-property-email-2-orlando-body': `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html>
    <head>
      <!-- Compiled with Bootstrap Email version: 1.3.1 --><meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style type="text/css">
        body,table,td{font-family:Helvetica,Arial,sans-serif !important}.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div{line-height:150%}a{text-decoration:none}*{color:inherit}a[x-apple-data-detectors],u+#body a,#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}img{-ms-interpolation-mode:bicubic}table:not([class^=s-]){font-family:Helvetica,Arial,sans-serif;mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0px;border-collapse:collapse}table:not([class^=s-]) td{border-spacing:0px;border-collapse:collapse}@media screen and (max-width: 600px){*[class*=s-lg-]>tbody>tr>td{font-size:0 !important;line-height:0 !important;height:0 !important}}
      </style>
    </head>
    <body class="" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
      <table class="body" valign="top" role="presentation" border="0" cellpadding="0" cellspacing="0" style="outline: 0; width: 100%; min-width: 100%; height: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: Helvetica, Arial, sans-serif; line-height: 24px; font-weight: normal; font-size: 16px; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #000000; margin: 0; padding: 0; border-width: 0;" bgcolor="#ffffff">
        <tbody>
          <tr>
            <td valign="top" style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
              <div class="">
                <div class="">
                  <table class="card-body" role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                      <tr>
                        <td style="line-height: 24px; font-size: 16px; margin: 0;" align="left">
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"> Hi [FIRST_NAME], </p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">I noticed since your enquiry on Orlando you haven&#8217;t been into the Display Suite.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">We would love to see you in there and be able to show you fixtures and fittings and give you more information on this amazing project.</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><b>Our display suite is open Saturdays 11am-1pm at 78-80 Orlando Street, Hampton. Alternatively, if you would like to make a private appointment please click here - <a href="[PROJECT_CONTACT_PERSON_CALENDLY]" style="color: #0d6efd;">Orlando Residences</a></b></p>
                          <br>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">Kind Regards,</p>
                          <br>
                          <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME]</p>
                          <br>
                          <br>
                          <div>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left">[AGENT_FULLNAME_CAPS] | <span class="text-gray-500" style="color: #a0aec0;">[AGENT_TITLE]</span></p>
                            <div><img width="300px" class="img" src="https://cdn.yourpave.com/agency/ca9cc8a3a376fc3133eb306082af3e4923e9eb45f407603d4ec0e6406aabe2efcfbe95ea7d93eda60a1f3b0086666d98b69b89257beb3dec75eac1306b9766fe.png" alt="Some Image" style="height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; border-style: none; border-width: 0;"></div>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left"><b>P:</b> +61 3 9644 2600  | <b>M:</b> [AGENT_MOBILE]</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">Melbourne  |  Sydney  |  Brisbane</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">7 Hotham Street, South Melbourne, VIC 3205</p>
                            <p class="text-sm" style="line-height: 16.8px; font-size: 14px; width: 100%; margin: 0;" align="left">www.360propertygroup.com.au</p>
                            <ul style="list-style-type: none; padding: 0px;">
                              [MEDIA_LINKS]
                            </ul>
                            <p style="line-height: 24px; font-size: 16px; width: 100%; margin: 0;" align="left"><strong><span class="text-danger" style="color: #dc3545;">WE WILL NEVER SEND BANK ACCOUNT DETAILS ONLINE, BY EMAIL OR BY SMS. WE WILL ONLY EVER PROVIDE SUCH DETAILS VERBALLY IN PERSON OR OVER THE PHONE.</span></strong></p>
                            <br>
                            <p class="text-gray-500 text-sm" style="line-height: 16.8px; font-size: 14px; color: #a0aec0; width: 100%; margin: 0;" align="left">Please consider the environment before printing this e-mail This email may contain confidential, copyright and/or privileged information and is intended only for use by the intended recipient. If you are not the intended recipient you must not use, copy or disclose the information in this email. If you have received this email in error please notify the sender immediately by return e-mail, and delete the e-mail and destroy any hard copies of the email. It is your responsibility to check this e-mail for viruses and other defects. Three Sixty Property Group Pty Ltd does not accept any liability for any loss or damage whatsoever and however caused which may result directly or indirectly from this e-mail or any attachments. The views, content and opinions in this e-mail are those of the sender and not necessarily of Three Sixty Property Group Pty Ltd except where this is specifically stated to be the case.</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
`,
  '360-property-hampton-bay-follow-up-sms': `
Hampton Bay Residences

Come and view a selection of plans and see the interiors at our display suite 78-80 Orlando St, Hampton.

Open Sat 11-1pm
Hamptonbaylife.com.au

`,
  '360-property-orlando-follow-up-sms': `
Orlando Residences

Come and view a selection of plans and see the interiors at our display suite 78-80 Orlando St, Hampton.

Open Sat 11-1pm
orlandoresidences.com.au
`,
};
