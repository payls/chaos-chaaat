module.exports = {
  'template-emailAlreadyExists-subject-1634979920823':
    'Looks like you already have an account',
  'template-emailAlreadyExists-body-1634979963140': `
  <p> 
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hello [FIRST_NAME],
      <br/><br/> 
      We couldn't create a new chaaat account as it looks like you already have an account with your email address. 
      <br/><br/>
      You can log in to your account or reset password if you need to here:
      <a href="[LOGIN_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Login</a>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
      <br/><br/>
      If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
  `,

  'template-emailVerification-subject-1601338955192':
    'Chaaat Email Verification',
  'template-emailVerification-body-1601338955192': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			Thank you for signing up with Chaaat.
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

  'template-emailVerification-subject-owner-1601338955192':
    'New Chaaat Sign Up!',
  'template-emailVerification-body-owner-1601338955192': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello Chaaat,
    <br/><br/>
    We would like to inform you that a new user has signed up to Chaaat. Please find the user details below:
    <br/><br/>
    <ul>
      <li>First name: [FIRST_NAME]</li>
      <li>Last name: [LAST_NAME]</li>
      <li>Email: [EMAIL]</li>
  </p>
`,
  'template-resetPassword-subject-1613818392997': 'Chaaat Forgotten Password',
  'template-resetPassword-body-1613818392997': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			There has been a request to reset your password to access Chaaat. However, given your account was created using Google Sign-in, you will need to use that to sign in again.
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
  'template-resetPassword-subject-1613806012993': 'Chaaat Forgotten Password',
  'template-resetPassword-body-1613806012993': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			There has been a request to reset your password for Chaaat.
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
  'template-resetPassword-subject-1613806153934': 'Chaaat Password Changed',
  'template-resetPassword-body-1613806153934': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME],
			<br/><br/>
			Your Chaaat password has recently changed.
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
			<a href="[COMMENT_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Reply</a>            
			<br/><br/>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,

  'template-commentPosted-subject-1658731996904': `You've received a comment on your project from [CONTACT_NAME]`,
  'template-commentPosted-body-1658732002183': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [AGENT_FIRST_NAME],
			<br/><br/>
			[CONTACT_NAME] has commented on your project!
			<br/><br/>
			<b>Project name</b>: [PROJECT_NAME]
			<br/>
      <div style="width: 90%; background-color: #eff2f6; border-radius: 10px; padding: 10px 15px; margin: 10px 0px;">[MESSAGE]</div>
			<br/>
			<a href="[COMMENT_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Reply</a>            
			<br/><br/>
			<br/><br/>
			Happy Selling!
			<br/>
			The Chaaat Team
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,

  'template-commentPosted-subject-1624117268': 'Chaaat Message from Agent',
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
			<a href="[COMMENT_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Reply</a>            
			<br/><br/>
			Best wishes,
			<br/>
			The Chaaat Team 
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,

  'template-shortlisted-property-subject-1624117469':
    'Chaaat Shortlisted Properties for review',
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
			<a href="[PERMALINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">View Proposal</a>            
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

  'template-shortlisted-project-subject-1624117469':
    'Chaaat Shortlisted Project for review',
  'template-shortlisted-project-body-1624117475': `
		<p>
<!--			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>-->
      <br/><br/>
			Hi [BUYER_FIRST_NAME],
			<br/><br/>
			You've received a shortlist of project to review from [AGENT_FIRST_NAME] from [AGENCY_NAME]:
			<br/><br/>
			Please click on the following link to review a wide range of information about the project and also provide us any thoughts or comments you may have.
			<br/><br/>
			<a href="[PERMALINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">View Proposal</a>            
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

  'template-invite-user-subject-1632282919050': `[USER_WHO_IS_INVITING] has invited you to join the [AGENCY_NAME] team at Chaaat!`,
  'template-invite-user-body-1632283174576': `
        <p>
   		     	<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
            <br/><br/>
            Welcome [INVITED_USER_NAME], 
            <br/><br/>
            [USER_WHO_IS_INVITING] has invited you to join Chaaat.
            <br/><br/>
            <a href="[SIGNUP_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Activate my account</a>            
            <br/><br/>
            Happy Selling!
            <br/>
            The Chaaat Team
            <br/><br/>
            Please note this is an automatically generated email and is not monitored for replies.
        </p>
    `,

  'template-buyer-activity-link-opened-email-subject-1639636972368': `Your Chaaat Proposal has been opened by [CONTACT_NAME]!`,
  'template-buyer-activity-link-opened-email-body-1639636982147': `
  <p>
		<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENT_NAME],
    <br/><br/>
    Your proposal was opened for the first time by [CONTACT_NAME]!
    <div style="width: 80%">
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px; display:flex;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Viewed From:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[ACTIVITY_LOCATION]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Viewed On:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[ACTIVITY_DEVICE]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
        <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Engagement Score (Total):</span>
        <span style="width: 49%; display: inline-block; text-align:right">[ENGAGEMENT_SCORE]</span>
      </div>
    </div>
    <br/>
    <br/>
    <a href="[ACTIVITY_STREAM_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px"> See more insights
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
  'template-buyer-activity-link-re-opened-email-subject-1639636972368': `Your Chaaat Proposal has been opened by [CONTACT_NAME]!`,
  'template-buyer-activity-link-re-opened-email-body-1639636982147': `
  <p>
		<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENT_NAME],
    <br/><br/>
    Your proposal was opened again by [CONTACT_NAME]!
    <div style="width: 80%">
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px; display:flex;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Viewed From:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[ACTIVITY_LOCATION]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Viewed On:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[ACTIVITY_DEVICE]</span>
      </div>
      <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
        <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Engagement Score (Total / Past 24 hours):</span>
        <span style="width: 49%; display: inline-block; text-align:right">[ENGAGEMENT_SCORE]</span>
      </div>
    </div>
  <br/>
  <br/>
    <a href="[ACTIVITY_STREAM_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px"> See more insights
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
  'template-buyer-activity-project-rated-email-subject-1640063289002': `Your project has been rated by [CONTACT_NAME]!`,
  'template-buyer-activity-project-rated-email-body-1639636982147': `
<p>
  <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
  <br/><br/>
  Hello [AGENT_NAME],
  <br/><br/>
  [CONTACT_NAME] has rated a project!
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
  'template-3-minute-buyer-activity-summary-email-subject-1647832776541-landing': `[CONTACT_NAME]`,
  'template-3-minute-buyer-activity-summary-email-front-body-1647832776541-landing': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_NAME],
    <br/><br/>
    [CONTACT_NAME].
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
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Engagement Score (Total / Past 24 hours):</span>
          <span style="width: 49%; display: inline-block; text-align:right">[ENGAGEMENT_SCORE]</span>
        </div>
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Time Spent:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[PAGE_TIME_SPENT]</span>
        </div>
    </div>
    <br/>
  `,
  'template-3-minute-buyer-activity-summary-email-subject-1647832776541': `Your Chaaat Proposal has been opened by [CONTACT_NAME]!`,
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
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Engagement Score (Total / Past 24 hours):</span>
          <span style="width: 49%; display: inline-block; text-align:right">[ENGAGEMENT_SCORE]</span>
        </div>
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Time Spent:</span>
          <span style="width: 49%; display: inline-block; text-align:right">[PAGE_TIME_SPENT]</span>
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
        <div style="border-bottom: 1px solid #d7dce5; font-size: 14px; padding-bottom: 5px; padding-top: 5px;">
          <span style="font-weight: bold; width: 49%; display: inline-block; vertical-align: top;">Time spent playing videos: </span>
          <span style="width: 49%; display: inline-block; text-align:right">[VIDEO_PLAY_TIME]</span>
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
    <a href="[CREATE_LINK_WIZARD]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Add Properties</a>            
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
  'template-request-contact-assignment-email-subject-1655190776633': `A new lead, [CONTACT_NAME], is ready to be sent a proposal!`,
  'template-request-contact-assignment-email-body-1655190776633': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
	  <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
	  Hi [AGENT_NAME],
	  <br/><br/>
	  A new lead, [CONTACT_NAME], is ready to be sent a proposal! 
	  <br/><br/>
	  Next step? Click on the button below or head to the Chaaat portal to create a proposal for the contact.
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
  'template-request-contact-assignment-email-subject-no-contact-name-1655190776633': `A new lead is ready to be sent a proposal!`,
  'template-request-contact-assignment-email-body-no-contact-name-1655190776633': `
  <div style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
	  <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
	  Hi [AGENT_NAME],
	  <br/><br/>
	  A new lead is ready to be sent a proposal! 
	  <br/><br/>
	  Next step? Click on the button below or head to the Chaaat portal to create a proposal for the contact.
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
  '1-agency-user-whatsapp-mobile-1622184418':
    'Retrieved agency user whatsapp mobile status successfully.',
  '2-agency-user-whatsapp-mobile-1622184497':
    'Failed to retrieve agency user whatsapp mobile status.',

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
  '2-user-management-delete-user-1652068512231': 'Failed to delete user.',

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
  '1-shortlisted-project-1621391826': 'Shortlisted project rated successfully.',
  '2-shortlisted-project-1621756437079':
    'Invalid project rating range provided.',
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

  '1-shortlisted-project-comment-1658393152947':
    'Created comment successfully.',
  '2-shortlisted-project-comment-1658393196015': 'Failed to create comment.',
  '1-shortlisted-project-comment-1658395150289':
    'Retrieved comments successfully.',
  '2-shortlisted-project-comment-1658395161503': 'Failed to retrieve comments.',

  '1-shortlisted-property-comment-1624292423648':
    'Created comment successfully but unit does not exist anymore so no email notifications will be sent to anyone.',
  '1-shortlisted-property-comment-1621787533608':
    'Retrieved comments successfully.',

  '2-shortlisted-property-comment-1621787545586':
    'Failed to retrieve comments.',

  '1-shortlisted-project-comment-1658735247891':
    'Retrieved comments successfully.',

  '2-shortlisted-project-comment-1658735254303': 'Failed to retrieve comments.',

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

  //  Custom Landing page
  '1-clp-1644979673273': 'Saved landing page successfully',
  '2-clp-1644979675411': 'Failed to save landing page',
  '3-clp-1644979675411': 'Failed to retrieve landing pages',
  '4-clp-1644979675411': 'Successfully retrieved landing pages',
  '5-clp-1644979675411': 'Successfully updated landing pages',
  '6-clp-1644979675411': 'Failed to update landing pages',

  // proposal template
  '2-proposal-template-1663834299369': 'No proposal template found.',
  '3-proposal-template-1663834299369':
    'Failed to retrieve proposal template with shortlisted properties.',
  '1-proposal-template-1663834299369':
    'Retrieved proposal template with shortlisted properties successfully.',

  '1-project-setting-proposal-template-1663834299369':
    'Successfully retrieve project setting proposal template.',
  '2-project-setting-proposal-template-1663834299369':
    'Failed to retrieve project setting proposal template.',

  '1-get-proposal-templates-1663834299369':
    'Successfully retrieved proposal templates.',
  '2-get-proposal-templates-1663834299369':
    'Failed to retrieve proposal templates.',
  '1-create-proposal-templates-1663834299369':
    'Successfully created proposal template.',
  '2-create-proposal-templates-1663834299369':
    'Failed to create proposal template.',
  '1-create-bulk-proposal-1663834299369':
    'Bulk Proposal Request Successfully sent.',
  '2-create-bulk-proposal-1663834299369': 'Failed to request bulk proposals.',
  '1-project-proposal-property-template-1663834299369':
    'Successfully retrieved project proposal properties.',
  '2-project-proposal-property-template-1663834299369':
    'No project proposal properties found.',
  '3-project-proposal-property-template-1663834299369':
    'Failed to retrieve project proposal properties.',
  '1-whatsapp-message-webhook-1663834299369':
    'Successfully retrieved whatsapp message webhook payload.',
  '2-whatsapp-message-failed-1663834299369': 'Failed to send message',
  '2-whatsapp-message-webhook-1663834299369':
    'Failed to retrieve whatsapp message webhook payload.',
  '2-whatsapp-onboarding-webhook-1663834299369':
    'Failed to process whatsapp onboarding payload.',
  '1-whatsapp-message-reply-1663834299369': 'Replied sent successfully.',
  '1-whatsapp-message-template-1663834299369':
    'Successfully retrieved whatsapp message templates.',
  '2-whatsapp-message-template-1663834299369':
    'Failed to retrieve whatsapp message templates from WA server. Please try again.',
  'template-whatsapp-interaction-subject-single-project-1639636972368': `[CONTACT_NAME] would like you to contact them about [PROJECT]`,
  'template-whatsapp-interaction-subject-multiple-project-1639636972368': `[CONTACT_NAME] would like you to contact them about a Proposal`,
  'template-whatsapp-interaction-email-body-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] would like you to reach out to them about the proposal with the below project(s):
    <br/>
    [PROJECT_LIST]
    <br/>
    Click the button below to start a whatsapp conversation with them.
		<br/><br/>
		<a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
      Start WhatsApp Conversation
    </a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>
  `,
  '1-whatsapp-messages-1663834299369':
    'Successfully retrieved whatsapp messages.',
  '2-whatsapp-messages-1663834299369': 'Failed to retrieve whatsapp messages.',
  '1-get-project-by-id-1668741556': 'Retrieved project successfully.',
  '2-get-project-by-id-1668741556': 'Failed to retrieve project.',
  '1-get-property-by-id-1668741556': 'Retrieved project property successfully.',
  '2-get-property-by-id-1668741556': 'Failed to retrieve project property.',
  '1-agency-campaign-performance-1622176515':
    'Retrieved campaign performance successfully',
  '2-agency-campaign-performance-1622176528':
    'Failed to retrieve campaign performance',
  '1-agency-waba-credentials-1622176515':
    'Retrieved agency WABA credentials successfully',
  '2-agency-waba-credentials-1622176528':
    'Failed to retrieve agency waba credentials',
  '1-agency-waba-template-credentials-1622176515':
    'Retrieved agency waba template credentials successfully',
  '2-agency-waba-template-credentials-1622176528':
    'Failed to retrieve agency WABA template credentials',
  '1-web-cta1-click-1663834299369':
    'Successfully registered response via webapp cta1 button.',
  '2-web-cta1-click-1663834299369':
    'Unable to register, please contact the company.',
  '1-web-cta1-click-confirmed-1663834299369':
    'CTA button clicked via webapp for current campaign.',
  '2-web-cta1-click-confirmed-1663834299369':
    'CTA button not clicked via webapp for current campaign.',
  '3-web-cta1-click-confirmed-1663834299369':
    'Error CTA1 webapp click confirmation.',
  'template-whatsapp-interaction-email-body-cta1-web-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] has RSVPd going to the <strong>[CAMPAIGN]</strong> event [DETAILS]
      <br/>
      <br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="https://staff.chaaat.io/inbox" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
    `,
  'template-whatsapp-interaction-generic-single-email-body-cta1-web-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] has RSVPd going to the <strong>[CAMPAIGN]</strong> event.
      <br/>
      <br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
    `,
  'template-whatsapp-interaction-generic-multiple-email-body-cta1-web-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] has RSVPd going to the event for the following campaign projects:
      <br/>
      [CAMPAIGN]
      <br/>
      <br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
    `,
  'template-whatsapp-interaction-generic-single-email-body-cta1-web-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] has RSVPd going to the [CAMPAIGN] event.
      <br/>
      <br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
    `,
  'template-whatsapp-interaction-generic-multiple-email-body-cta1-web-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] has RSVPd going to the event for the following campaign projects:
      <br/>
      [CAMPAIGN]
      <br/>
      <br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
    `,
  '1-whatsapp-campaign-name-1663834299369':
    'Successfully updated campaign name.',
  '2-whatsapp-campaign-name-1663834299369': 'Failed to update campaign name.',
  'template-whatsapp-interaction-subject-strength-culture-1639636972368':
    '[CONTACT_NAME] has registered for the Personal Training Group Classes',
  'template-whatsapp-interaction-strength-culture-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] has registered for the Personal Training Group Classes.
      <br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
  `,
  '1-resend-invite-1663834299369':
    'Resend account activation email successful.',
  '2-resend-invite-1663834299369': 'Resend account activation email failed.',
  '1-whatsapp-campaign-download-1663834299369':
    'Successfully downloaded campaign reports.',
  '2-whatsapp-campaign-dowload-1663834299369':
    'Failed to download campaign reports.',
  'template-whatsapp-interaction-subject-breathe-pilates-prospect-1639636972368':
    '[CONTACT_NAME] registered interest on the Complimentary Movement Assessment Offer',
  'template-whatsapp-interaction-breathe-pilates-prospect-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] registered interest on the Complimentary Movement Assessment offer when they sign up for any <strong>New Starter Package</strong>.
      <br/><br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
  `,
  'template-whatsapp-interaction-subject-breathe-pilates-re-engagement-1639636972368':
    '[CONTACT_NAME] registered interest on the 10% Discount Offer',
  'template-whatsapp-interaction-breathe-pilates-re-engagement-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] registered interest on the 10% discount offer for their next package purchase.
      <br/><br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
  `,
  'template-whatsapp-interaction-subject-hybrid-gym-1639636972368':
    '[CONTACT_NAME] has registered intereset on the Personal Training Programme offer',
  'template-whatsapp-interaction-hybrid-gym-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CONTACT_NAME] has registered interest for the Labour Long Weekend Personal Training Programme special rate.
      <br/>
      Click the button below to start a whatsapp conversation with them.
      <br/><br/>
      <a href="[WHATSAPP_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        Start WhatsApp Conversation
      </a>
      <br/><br/>
      Happy Selling!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
  `,
  '1-agency-additional-cta-1622176515':
    'Successfully retrieved agency additional CTAs',
  '2-agency-additional-cta-1622176528':
    'Failed to retrieve agency additional CTAs',
  '1-inbox-1622176002': 'Retrieved list of conversations successfully',
  '2-inbox-1622176015': 'Failed to retrieve list of conversations',
  '1-stripe-1622176015': 'Successfull operation',
  '2-stripe-error-1622176015': 'No subscription found',
  '3-stripe-1622176015': 'Subscription found',
  'stripe-1622176015-cancel-success': 'Subscription cancellation successfull',
  'stripe-1622176015-cancel-failed': 'Subscription cancellation failed',
  '1-campaign-schedule-1622176002': 'Retrieved scheduled campaigns',
  '2-campaign-schedule-1622176015': 'Failed to retrieve scheduled campaigns',
  '1-campaign-schedule-1652073666416': 'Campaign schedule updated',
  '2-campaign-schedule-1630304759': 'Campaign schedule not found',
  '3-campaign-schedule-1652073666416': 'Failed to update campaign schedule',
  '1-campaign-recipients-1622176002': 'Retrieved list of campaign recipients',
  '2-campaign-recipients-1622176015': 'Failed to retrieve campaign recipients',
  '1-agency-waba-1622176015': 'WABA status retrieved',
  '2-agency-waba-1622176015': 'No WABA found for this agency',
  '3-agency-waba-1622176015': 'Error retrieving WABA status',

  // Email Notification
  '1-save-success-email-notification-1685583754': 'Successfully saved settings',
  '1-save-error-email-notification-1685583754': 'Unabled to save settings',
  '2-get-success-email-notification-1685583754':
    'Successfully retrieved settings',
  '2-get-error-email-notification-1685583754': 'Unabled to retrieved settings',
  '1-whatsapp-message-template-sync-1663834299369':
    'Successfully synced agency templates',
  '2-whatsapp-message-template-sync-1663834299369':
    'Failed to sync agency templates',
  '1-template-creation-1620396460': 'Template submission successful',
  '2-template-creation-1620396470': 'Failed to submit template',
  '1-delete-whatsapp-message-template-1663834299369':
    'WABA template successfully deleted',
  '2-delete-whatsapp-message-template-1663834299369':
    'Failed to delete WABA template',
  '1-template-update-1620396460': 'Template submission successful',
  '2-template-update-1620396470': 'Failed to submit template update',
  '1-contact-list-1620396460': 'Contact list created',
  '2-contact-list-1621771554': 'Contact list name already exists',
  '2-contact-list-1620396470': 'Failed to create contact list',
  '1-contact-list-1663834299369': 'Contact list retrieved',
  '2-contact-list-1663834299369': 'Failed to get contact list',
  '2-invite-1632352801443':
    'User with same email address from other agency already exists',
  '1-delete-contact-list-user-1663834299369': 'Contact list user removed',
  '2-delete-contact-list-user-1663834299369':
    'Failed to remove user from contact list',
  '1-delete-contact-list-1663834299369': 'Contact list deleted',
  '2-delete-contact-list-1663834299369': 'Failed to rdelete contact list',
  '1-contact-list-update-1620396460': 'Contact list saved',
  '2-contact-list-update-1621771554': 'Contact list name already exists',
  '2-contact-list-update-1620396470': 'Failed to update contact list',
  'automation-category-1689818819-retrieved-success':
    'Successfully retrieved automation categories',
  'automation-category-1689818819-retrieved-failed':
    'Failed to retrieve automation categories',
  'automation-category-1689818819-save-success':
    'Successfully created category',
  'automation-category-1689818819-save-failed': 'Failed to create category',
  'automation-category-1689818819-delete-success':
    'Successfully removed category',
  'automation-category-1689818819-delete-failed': 'Failed to remove category',
  'automation-rules-1689818819-retrieved-success':
    'Successfully retrieved rules',
  'automation-rules-1689818819-retrieved-failed': 'Failed to retrieve rules',
  'automation-rules-1727767003373-active-count-success':
    'Successfully retrieved active rules',
  'automation-rules-1727767003373-active-count-failed':
    'Failed to retrieve active rules',
  'automation-packages-1689818819-retrieved-success':
    'Successfully retrieved automation categories',
  'automation-packages-1689818819-retrieved-failed':
    'Failed to retrieve automation categories',
  'automation-trigger-1689818819-retrieved-success':
    'Successfully retrieved automation categories',
  'automation-trigger-1689818819-retrieved-failed':
    'Failed to retrieve automation categories',
  'automation-rule-1689818819-save-success': 'Successfully created rule',
  'automation-rule-1689818819-save-failed': 'Failed to create rule',
  'automation-rule-1689818819-update-success': 'Successfully updated rule',
  'automation-rule-1689818819-update-failed': 'Failed to updated rule',
  'automation-rule-1689818819-delete-success': 'Successfully deleted rule',
  'automation-rule-1689818819-delete-failed': 'Failed to delete rule',
  '1-automation-workflow-approval-request-1722411549713':
    'Successfully sent for approval',
  '2-automation-workflow-approval-request-1722411549717':
    'Failed to sent for approval',
  'campaign-schedule-1699538580-creation-failed': 'Failed to create a campaign',
  'campaign-schedule-1699538580-creation-success':
    'Successfully created a campaign',
  'agency-integration-setting-1689818819-create-success':
    'Successfully created integration',
  'agency-integration-setting-1689818819-create-failed':
    'Failed to integration mindbody to account',
  'agency-integration-setting-1689818819-retrieve-success':
    'Successfully retrieve setting integration',
  'agency-integration-setting-1689818819-retrieve-failed':
    'Failed to retrieve integration',
  'agency-integration-setting-1689818819-retrieve-not-found':
    'Integration not found',
  'appsync-id-1689818819-generation-success':
    'Successfully generated appsync api key',
  'appsync-id-1689818819-generation-error': 'Failed generating appsync api key',
  'campaign-draft-ready-for-review-subject-1639636972368':
    'A campaign draft for [AGENCY] is ready for review',
  'campaign-draft-ready-for-review-body-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [AGENT_FIRST_NAME],
      <br/><br/>
      [CAMPAIGN_DRAFT_NAME] is now ready for review.
      <br/>
      Click the button below to view the draft.
      <br/><br/>
      <a href="[REVIEW_LINK]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
        View Draft
      </a>
      <br/><br/>
      Thank you!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>
  `,
  'contact-note-1692757100-create-success': 'Successfully created contact note',
  'contact-note-1692757100-create-failed': 'Failed to create note',
  'contact-note-1692757100-retrieve-success':
    'Successfully retrieved contact note',
  'contact-note-1692757100-retrieve-failed': 'Failed to retrieve note',
  'contact-note-1692757100-delete-success': 'Successfully removed contact note',
  'contact-note-1692757100-delete-failed': 'Failed to remove note',
  'contact-note-1692757100-update-success': 'Successfully updated contact note',
  'contact-note-1692757100-update-failed': 'Failed to update note',
  'contact-note-1692757100-update-not-found':
    'Contact note not found in contact',
  '1-delete-campaign-draft-1663834299369':
    'Successfully deleted campaign draft',
  '2-delete-campaign-draft-1663834299369': 'Failed to delete campaign draft',
  'contact-1693362197-update-engagement-success':
    'Successfully updated contact engagements',
  'contact-1693362197-update-engagement-failed':
    'Failed to update contact engagements',
  'automation-webhook-checker-1689818819-success':
    'Successfully checked/updated webhooks',
  'automation-webhook-checker-1689818819-failed':
    'Failed to checke/update webhooks',
  '2-whatsapp-message-failed-different-mobile-number-1663834299369': `Contact mobile ([CONTACT_NUMBER]) is different from this thread's number ([THREAD_NUMBER]). Please check number and try again.`,
  '2-live-chat-message-webhook-1663834299369':
    'Failed to retrieve live chat message webhook payload.',
  'automation-form-1689818819-retrieve-success': 'Successfully retrieved forms',
  'automation-form-1689818819-retrieve-failed': 'Failed to retrieve forms',
  'automation-hubspot-1689818819-run-immediate-success':
    'Successfully run HubSpot automation',
  'automation-hubspot-1689818819-run-immediate-failed':
    'Failed to run HubSpot automation',
  '1-live-chat-session-start-1663834299369':
    'Successfully started a live chat session.',
  '2-live-chat-session-start-1663834299369':
    'Failed to start live chat session.',
  '1-live-chat-session-end-1663834299369':
    'Successfully ended a live chat session.',
  '2-live-chat-session-end-1663834299369': 'Failed to end live chat session.',
  '3-live-chat-session-1663834299369': 'Live chat session not found.',
  '1-livechat-messages-1663834299369':
    'Successfully retrieved live chat messages.',
  '2-livechat-messages-1663834299369': 'Failed to retrieve live chat messages.',
  '2-livechat-message-webhook-1663834299369':
    'Failed to retrieve live chat message webhook payload.',
  'live-chat-settings-1692757100-generate-success':
    'Successfully generated chat settings',
  'live-chat-settings-1692757100-generate-failed':
    'Failed to generate chat settings',
  'live-chat-settings-1692757100-update-success':
    'Successfully updated chat settings',
  'live-chat-settings-1692757100-update-failed':
    'Failed to update chat settings',

  'live-chat-settings-1692757100-retrive-success':
    'Successfully retrieved chat settings',
  'live-chat-settings-1692757100-retrive-failed':
    'Failed to retrieve chat settings',
  'template-livechat-interaction-subject-1639636972368': `[AGENT_FIRST_NAME] sent a live chat message`,
  'template-livechat-interaction-email-body-1651855722401': `
    <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
      <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
      Hi [CONTACT_NAME],
      <br/><br/>
      [AGENT_FIRST_NAME] from [AGENCY] has responded to your live chat message.
      <br/>
      <br/>
      Message Content:
      <br/><br/>
      <i>[MESSAGE]</i>
      <br/><br/>
      Thank you!
      <br/>
      The Chaaat Team
      <br/><br/>
      Please note this is an automatically generated email and is not monitored for replies.
    </p>`,
  '2-line-message-failed-1663834299369': 'Failed to send Line message',
  '2-line-message-failed-unfollowed-1663834299369':
    'Failed to send Line message. Line account either blocked or not yet followed by contact',
  'contact-search-1692757100-retrieve-success':
    'Successfully retrieved contacts',
  'contact-search-1692757100-retrieve-failed': 'Failed to retrieve contacts',
  'live-chat-cities-1692757100-retrieve-failed':
    'Failed to retrieve live chat cities',
  'live-chat-cities-1692757100-retrieve-success': 'Live chat cities retrieved',
  'automation-history-insight-1689818819-success':
    'Automation history insight retrieved',
  'automation-history-insight-1689818819-failed':
    'Failed to retreive automation history insight',
  'automation-history-recipients-1689818819-success':
    'Automation history recipients retrieved',
  'automation-history-recipients-1689818819-failed':
    'Failed to retreive automation history recipients',
  '1-line-messages-1663834299369': 'Successfully retrieved line messages.',
  '2-line-messages-1663834299369': 'Failed to retrieve line messages.',
  '1-messenger-messages-1663834299369':
    'Successfully retrieved messenger messages.',
  '2-messenger-messages-1663834299369':
    'Failed to retrieve messenger messages.',
  '2-messenger-message-failed-1663834299369': 'Failed to send message',
  '1-messenger-message-reply-1663834299369': 'Replied sent successfully.',
  '1-agency-channel-list-1622176015': 'Channels retrieved',
  '2-agency-channel-list-1622176015': 'No channels found',
  '3-agency-channel-list-1622176015': 'Failed to retrieve channel list',
  '1-line-template-draft-creation-1663834299369': 'Line draft template created',
  '2-line-template-draft-creation-1620396470':
    'Failed to create Line draft template',
  '1-line-template-published-creation-1663834299369': 'Line template created',
  '2-line-template-published-creation-1620396470':
    'Failed to create Line template',
  '1-line-template-draft-update-1663834299369': 'Line template updated',
  '2-line-template-draft-update-1620396470': 'Failed to update Line template',
  '1-line-template-published-update-1663834299369': 'Line template updated',
  '2-line-template-published-update-1620396470':
    'Failed to update Line template',
  '1-delete-line-message-template-1663834299369':
    'Line template successfully deleted',
  '2-delete-line-message-template-1663834299369':
    'Failed to delete Line template',
  '1-agency-channel-1622176015': 'Channel retrieved',
  '2-agency-channel-1622176015': 'Failed to retrieve channel',
  '1-agency-channel-created-1622176015': 'Channel created',
  '2-agency-channel-created-1622176015': 'Failed to create channel',
  '1-hide-campaign-1663834299369': 'Campaign hidden',
  '2-hide-campaign-1663834299369': 'Failed to hide campaign',
  '1-subcription-webhook-1663834299369': 'Successfully updated subscrption',
  '2-subcription-webhook-1663834299369': 'Failed to run subscription webhook',
  'unsubscribe-texts-1692757100-retrieve-success':
    'Unsubscribe Texts retrieved',
  'unsubscribe-texts-1692757100-retrieve-failed':
    'Failed to retrieve Unsubscribe Texts',
  '1-unsubscribe-text-1622176015': 'Unsubscribe text created',
  '2-unsubscribe-text-1622176015': 'Failed to create unsubscribe text',
  '1-delete-unsubscribe-trigger-text-1663834299369':
    'Trigger text successfully deleted',
  '2-delete-unsubscribe-trigger-text-1663834299369':
    'Failed to delete trigger text',
  '1-messenger-access-token-1663834299369': 'Messenger Page connected',
  '2-messenger-access-token-1663834299369': 'Failed to connect Messenger Page',
  '1-messenger-webhook-subscription-1663834299369':
    'Messenger Page subscribed to webhook',
  '2-messenger-webhook-subscription-1663834299369':
    'Failed to subscribe to webhook',
  '1-tec-sf-lead-1663834299369': 'TEC Salesforce Lead created',
  '2-tec-sf-lead-1663834299369': 'Failed to create TEC Salesforce Lead',
  '1-whatsapp-onboarding-1622176015':
    'Successfully submitted WhatsApp onboarding details',
  '2-whatsapp-onboarding-1622176015':
    'Failed to submit WhatsApp onboarding details',
  '3-whatsapp-onboarding-1622176015': 'Only Super Admin can do this action',
  '1-whatsapp-onboarding-submissions-1622176515':
    'Successfully Retreived WhatsApp Onboarding Data',
  '2-whatsapp-onboarding-submissions-1622176515':
    'Failed to Retreive WhatsApp Onboarding Data',
  '1-delete-whatsapp-onboarding-submission-1622176515':
    'Successfully deleted onboarding record',
  '2-delete-whatsapp-onboarding-submission-1622176515':
    'Failed to delete onboarding record',
  '1-whatsapp-config-1622176015':
    'Successfully submitted WhatsApp config details',
  '2-whatsapp-config-1622176015': 'Failed to submit WhatsApp config details',
  'template-support-emailVerification-subject-1601338955192':
    'Chaaat Support Email Verification',
  'template-support-emailVerification-body-1601338955192': `
		<p>
			<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
      <br/><br/>
			Hello [FIRST_NAME] [LAST_NAME],
			<br/><br/>
			A new client with name [AGENCY_NAME] has been created, that triggered creation of a new support account.
			<br/><br/>
			To complete the support account creation, please click the button below:
			<br/><br/>
			<a href="[EMAIL_VERIFICATION_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">Confirm email</a>
			<br/><br/>
			Or copy and paste this URL into a new tab of your browser:
			<br/>
			<a href="[EMAIL_VERIFICATION_URL]">[EMAIL_VERIFICATION_URL]</a>
			<br/><br/>
      Also, here is the password once this support account is verified: <strong>[PASSWORD]</strong>
      <br/>
      <strong>Please change your password right after your account is verified.</strong>
      <br/><br/>
			Thank you!
			<br/>
			The Chaaat Team
			<br/><br/>
			If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.

		</p>
	`,
  'template-onboarding-pending-subject-1601338955192':
    'WhatsApp Onboarding Request Created',
  'template-onboarding-pending-body-1601338955192': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [FIRST_NAME] [LAST_NAME],
    <br/><br/>
    This is to confirm that we received your WhatsApp onboarding request for [AGENCY_NAME], with the following details:
    <br/><br/>
    Facebook Manager ID: [FACEBOOK_ID]
    <br/>
    Company Name: [ONBOARDING]
    <br/>
    Address: [ADDRESS]
    <br/>
    Email: [EMAIL]
    <br/>
    Website: [WEBSITE]
    <br/><br/>
    In order for us to proceed, kindly provide our onboarding personnel with email address meta@chaaat.io a temporary access on your Meta Business Account.
    <br/><br/>
    <a href="https://business.facebook.com/settings/people?business_id=[FACEBOOK_ID]" style="font-weight: bold;">Click here to manage your Business Account.</a>
    <br/><br/>
    Once access is provided, processing the request will take up to 48 hours.
    <br/><br/>
    To view your request you may click below, and under WhatsApp, click View Accounts:
    <br/><br/>
    <a href="[URL]/settings/integrations" style="font-weight: bold;">View Onboarding Request</a>
    <br/><br/>
    We will also be sending you an email regarding the status of your request.
    <br/><br/>
    Thank you!
    <br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.

  </p>
`,
  'template-onboarding-submitted-subject-1601338955192':
    'WhatsApp Onboarding Request Submitted',
  'template-onboarding-submitted-body-1601338955192': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [FIRST_NAME] [LAST_NAME],
    <br/><br/>
    This is to inform you that your WhatsApp onboarding request for [AGENCY_NAME], with the following details have been submitted and waiting for completion:
    <br/><br/>
    Facebook Manager ID: [FACEBOOK_ID]
    <br/>
    Company Name: [ONBOARDING]
    <br/>
    Address: [ADDRESS]
    <br/>
    Email: [EMAIL]
    <br/>
    Website: [WEBSITE]
    <br/><br/>
    To view your request you may click below, and under WhatsApp, click View Accounts:
    <br/><br/>
    <a href="[URL]/settings/integrations" style="font-weight: bold;">View Onboarding Request</a>
    <br/><br/>
    We will also be sending you an email when processing of request is completed.
    <br/><br/>
    Thank you!
    <br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.

  </p>
`,
  'template-onboarding-confirmed-subject-1601338955192':
    'WhatsApp Onboarding Request Completed',
  'template-onboarding-confirmed-body-1601338955192': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [FIRST_NAME] [LAST_NAME],
    <br/><br/>
    This is to inform you that your WhatsApp onboarding request for [AGENCY_NAME], with the following details have been completed:
    <br/><br/>
    Facebook Manager ID: [FACEBOOK_ID]
    <br/>
    Company Name: [ONBOARDING]
    <br/>
    Address: [ADDRESS]
    <br/>
    Email: [EMAIL]
    <br/>
    Website: [WEBSITE]
    <br/><br/>
    <a href="[URL]/dashboard/leads/all-leads?link_action=get-started" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    Thank you!
    <br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.

  </p>
`,
  'template-resend-invite-user-subject-1632282919050': `You have been reinvited to join the [AGENCY_NAME] team at Chaaat!`,
  'template-resend-invite-user-body-1632283174576': `
        <p>
   		     	<img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
            <br/><br/>
            Hi [INVITED_USER_NAME], 
            <br/><br/>
            You have been reinvited to join the [AGENCY_NAME] team at Chaaat.
            <br/><br/>
            <a href="[SIGNUP_URL]">Click here to activate account</a>            
            <br/><br/>
            Thank you!
            <br/>
            The Chaaat Team
            <br/><br/>
            Please note this is an automatically generated email and is not monitored for replies.
        </p>
    `,
  '1-resend-verification-1663834299369':
    'Successfully resent verification email',
  '2-resend-verification-1663834299369': 'Failed to resend verification email',
  '2-auth-company-name-1608510138480':
    'Company Name already in use. Please try another.',
  '1-agency-message-stat-1622176515': 'Messaging stats retrieved',
  '2-agency-message-stat-1622176528': 'Failed to retrieve messaging stats',
  '1-contact-salesforce-update-1621773321':
    'Contact salesforce record updated.',
  '2-contact-salesforce-update-1621773321':
    'Failed to update contact salesforce record.',
  '1-partial-whatsapp-config-1622176015':
    'Successfully submitted partial WhatsApp config details',
  '2-partial-whatsapp-config-1622176015':
    'Failed to submit partial WhatsApp config details',
  '1-whatsapp-config-1622176515':
    'Successfully Retrieved WhatsApp Business Account Record',
  '2-whatsapp-config-1622176515':
    'Failed to Retrieve WhatsApp Business Account Record',
  '1-complete-whatsapp-config-1622176015':
    'Successfully completed and confirmed WhatsApp config details',
  '1-complete-whatsapp-config-1622176077':
    'Successfully deleted WhatsApp config details',
  '2-complete-whatsapp-config-1622176015':
    'Failed to complete WhatsApp config details',
  '1-agency-inventory-1622176015': 'Agency inventory retrieved',
  '2-agency-inventory-1622176015': 'Failed to get agency inventory',
  '2-subscription-1688322115':
    'Not allowed to send message: No active subscriptions found',
  '2-not-allowed-to-send-whatsapp-message-1688322115':
    'Not allowed to send message',
  '2-no-message-credits-1688322115':
    'Not allowed to send message: No more message credits',
  '2-subscription-expired-1688322115':
    'Not allowed to send message: Current subscription expired',
  '2-live-chat-settings-1692757100-create-endpoint-incomplete':
    'Failed to update live chat settings. Create API endpoint details incomplete',
  '2-live-chat-settings-1692757100-update-endpoint-incomplete':
    'Failed to update live chat settings. Update API endpoint details incomplete',
  '2-live-chat-settings-1692757100-oauth-endpoint-incomplete':
    'Failed to update live chat settings. OAuth API endpoint details incomplete',
  '2-hubspot-contact-list-oauth-1663834299369': 'Failed to connect to Hubspot',
  '1-matrix-1608509359974': 'Successfully retrieved pricing matrix',
  '2-matrix-1608510138480': 'Failed to retrieve pricing matrix',
  '1-update-automation-rule-template-flow-data-1722316217000':
    'Successfully updated Automation Rule Template Flow Data',
  '2-update-automation-rule-template-flow-data-1722316217000':
    'Failed to Update Automation Rule Template Flow Data',
  '2-complete-whatsapp-config-1622176077':
    'Failed to delete WhatsApp config details',
  '2-whatsapp-message-failed-inactive-contact-1663834299369':
    'Sending message to an inactive contact is not allowed',
  '1-contact-archived-1652766684694':
    'Selected contact(s) archived successfully',
  '2-contact-archived-1652766684694': 'Failed to archive contact(s)',
  '2-template-creation-business-account-1620396470':
    'Failed to process request. No business account selected',
  '2-template-creation-template-name-1620396470':
    'Failed to process request. Template name not provided',
  '1-waba-sync-details-1622176077': 'Agency waba details synced',
  '1-waba-sync-details-empty-1622176077': 'No agency waba found',
  '2-waba-sync-details-1622176077': 'Failed syncing agency waba details',
  '2-contact-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature",
  '2-active-contact-limit-1688322115':
    "You've reached your limit for active contacts. To add new ones, consider upgrading your subscription or managing your existing contacts to free up space",
  '2-update-active-contact-limit-1688322115':
    "You've reached your limit for active contacts. To add new ones, consider upgrading your subscription or managing your existing contacts to free up space",
  '2-salesforce-active-contact-limit-1688322115':
    "You've reached your limit for active contacts. To add new ones, consider upgrading your subscription or managing your existing contacts to free up space",
  '2-user-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock user creation",
  '2-user-subscription-limit-1688322115':
    "You've reached your limit for users. To add new ones, consider upgrading your subscription or managing your existing users to free up space",
  '2-automation-subscription-limit-1688322115':
    'Not allowed to activate automation: Number of allowed active automations reached',
  '2-no-campaign-credits-1688322115':
    "You've reached your limit for campaigns. To add new ones, consider upgrading your subscription or managing your existing campaigns to free up space",
  '2-campaign-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature ",
  '2-subscription-campaign-expired-1688322115':
    'Not allowed to initialte campaign: Current subscription expired',
  '2-no-waba-credits-1688322115':
    "You've reached your limit for Channel. To add new ones, consider upgrading your subscription or managing your existing channels to free up space",
  '2-waba-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature ",
  '2-subscription-waba-expired-1688322115':
    'Not allowed to onboard channel: Current subscription expired',
  '2-contact-list-upload-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature",
  '2-contact-list-upload-contact-limit-1688322115':
    "You've reached your limit for active contacts. To add new ones, consider upgrading your subscription or managing your existing contacts to free up space",
  '2-contact-list-hubspot-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature",
  '2-contact-list-hubspot-contact-limit-1688322115':
    "You've reached your limit for active contacts. To add new ones, consider upgrading your subscription or managing your existing contacts to free up space",
  '2-contact-list-salesforce-report-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature",
  '2-contact-list-salesforce-report-contact-limit-1688322115':
    "You've reached your limit for active contacts. To add new ones, consider upgrading your subscription or managing your existing contacts to free up space",
  '2-subscription-contact-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature",
  '2-contact-limit-1688322115':
    "You've reached your limit for active contacts. To add new ones, consider upgrading your subscription or managing your existing contacts to free up space",
  'subscription-no-subscription-subject': `[AGENCY_NAME]: No Subscription`,
  'subscription-no-subscription-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that your account failed to [ACTION], because of not being subscribed to any of our subscription plans.
    <br/><br/>
    To avoid any disruptions to your service, we recommend subscribing to our plans that will suit your needs. You can easily manage your subscription by clicking the link below:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-subscription-expired-subject': `[AGENCY_NAME]: Subscription Expired`,
  'subscription-subscription-expired-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that your account failed to [ACTION], because your subscription is already expired.
    <br/><br/>
    To avoid any disruptions to your service, we resubscribing to our plans that will suit your needs. You can easily manage your subscription by clicking the link below:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-contact-limit-reached-subject': `[AGENCY_NAME]: Active Contacts Limit Reached`,
  'subscription-contact-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've already reached 100% of your active contacts quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-message-limit-reached-subject': `[AGENCY_NAME]: Monthly Message Limit Reached`,
  'subscription-message-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've already reached 100% of your messaging quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-80-contact-limit-reached-subject': `[AGENCY_NAME]: 80% of Active Contacts Limit Reached`,
  'subscription-80-contact-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've reached 80% of your quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-90-contact-limit-reached-subject': `[AGENCY_NAME]: 90% of Active Contacts Limit Reached`,
  'subscription-90-contact-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've reached 90% of your quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-100-contact-limit-reached-subject': `[AGENCY_NAME]: 100% of Active Contacts Limit Reached`,
  'subscription-100-contact-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've reached 100% of your quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-80-message-limit-reached-subject': `[AGENCY_NAME]: 80% of Monthly Message Limit Reached`,
  'subscription-80-message-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've already reached 80% of your quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-90-message-limit-reached-subject': `[AGENCY_NAME]: 90% of Monthly Message Limit Reached`,
  'subscription-90-message-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've already reached 90% of your quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-100-message-limit-reached-subject': `[AGENCY_NAME]: 100% of Monthly Message Limit Reached`,
  'subscription-100-message-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've already reached 100% of your quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  'subscription-daily-100-contact-message-limit-reached-subject': `[AGENCY_NAME]: 100% of Quota Limit Reached Reminder`,
  'subscription-daily-100-contact-message-limit-reached-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that you've reached 100% of your quota capacity. Below is a detailed summary of your current usage:
    <br/><br/>
    [OTHER]
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  '2-subscription-contact-expired-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature",
  '2-subscription-user-expired-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature ",
  '2-subscription-rule-expired-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature ",
  '2-automation-subscription-1688322115':
    "We couldn't find an active subscription on your account. Please renew or start a new subscription to unlock this feature ",
  'subscription-trial-ends-tomorrow-subject': `[AGENCY_NAME]: Trial Subscription Will End Tomorrow`,
  'subscription-trial-ends-tomorrow-body': `
  <p>
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hello [AGENCY_NAME],
    <br/><br/>
    We're reaching out to let you know that your trial subscription period wll end tomorrow, [OTHER].
    <br/><br/>
    To avoid any disruptions to your service, we recommend upgrading your subscription to better suit your needs. You can easily manage your subscription by clicking this link:
    <br/><br/>
    <a href="[URL]" style="font-weight: bold;">Click here to get started!</a>
    <br/><br/>
    If you have any questions or concerns, please don't hesitate to reach out. Our dedicated support team is here to assist you.
    <br/><br/>
    Thank you for your prompt attention to this matter.
    <br/><br/>
    The Chaaat Team
    <br/><br/>
    If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
  </p>
`,
  '1-agency-oauth-timeslot-1726049944':
    'Sucessfully Updated Agency Oauth Timeslot Settings',
  '2-agency-oauth-timeslot-1726049944':
    'Failed to Updated Agency Oauth Timeslot Settings',
  '1-agency-oauth-get-timeslot-1726049944':
    'Sucessfully Fetched Timeslot Settings',
  '2-agency-oauth-get-timeslot-1726049944': 'Failed to Fetch Timeslot Settings',
  '1-hubspot-contact-list-1730254199':
    'HubSpot contact lists fetched successfully.',
  '2-hubspot-contact-list-1730254199':
    'Failed to retrieve HubSpot contact lists.',
  '1-hubspot-contact-list-members-1730254462':
    'Successfully retrieved hubspot list members',
  '2-hubspot-contact-list-members-1730254462':
    'Failed to retrieve hubspot list members',
  '1-contact-list-in-progress-1620396460': 'Creating contact list in progress',
  '2-contact-list-not-found-1621771554': 'Contact list not found',
  '2-contact-list-in-progress-1620396460':
    'Failed to process contact list request',
  '1-hubspot-contact-1663834299369': 'Successfully retrieved HubSpot contacts',
  '2-hubspot-contact-1663834299369': 'Failed to retrieve HubSpot contacts',
  '1-hubspot-contacts-1730254198': 'HubSpot contacts imported successfully',
  '2-hubspot-contacts-1730254198': 'Failed to import HubSpot contacts',
};
