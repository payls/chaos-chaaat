module.exports = {
  'template-emailVerification-subject-1601338955192': 'Pave Email Verification',
  'template-emailVerification-body-1601338955192': `
		<p>
			Hello [FIRST_NAME],
			<br/><br/>
			Thank you for signing up with Pave.
			<br/><br/>
			To complete the sign up process, please click the button below:
			<br/><br/>
			<a href="[EMAIL_VERIFICATION_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; text-transform: capitalize; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Confirm Email</a>
			<br/><br/>
			Or copy and paste this URL into a new tab of your browser:
			<br/>
			<a href="[EMAIL_VERIFICATION_URL]">[EMAIL_VERIFICATION_URL]</a>
			<br/><br/>
			If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
			<br/><br/>
			Best wishes,
			<br/>
			The Chaaat Team
		</p>
	`,
  'template-resetPassword-subject-1613818392997': 'Pave Forgotten Password',
  'template-resetPassword-body-1613818392997': `
		<p>
			Hello [FIRST_NAME],
			<br/><br/>
			There has been a request to reset your password to access Pave. However, given your account was created using Google Sign-in, you will need to use that to sign in again.
			<br/><br/>
			<a href="[LOGIN_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; text-transform: capitalize; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Login</a>
			<br/><br/>
			If you didn't make this request, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
			<br/><br/>
			Best wishes,
			<br/>
			The Chaaat Team
		</p>
	`,
  'template-resetPassword-subject-1613806012993': 'Pave Forgotten Password',
  'template-resetPassword-body-1613806012993': `
		<p>
			Hello [FIRST_NAME],
			<br/><br/>
			There has been a request to reset your password for Pave.
			<br/><br/>
			To complete the reset password process, please click the button below:
			<br/><br/>
			<a href="[RESET_PASSWORD_URL]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 0px; text-transform: capitalize; background-color: #08453D; margin: 0; border-color: #08453D; border-style: solid; border-width: 10px 40px;">Reset Password</a>
			<br/><br/>
			Or copy and paste this URL into a new tab of your browser:
			<br/>
			<a href="[RESET_PASSWORD_URL]">[RESET_PASSWORD_URL]</a>
			<br/><br/>
			If you didn't make this request, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
			<br/><br/>
			Best wishes,
			<br/>
			The Chaaat Team
		</p>
	`,
  'template-resetPassword-subject-1613806153934': 'Pave Password Changed',
  'template-resetPassword-body-1613806153934': `
		<p>
			Hello [FIRST_NAME],
			<br/><br/>
			Your Pave password has recently changed.
			<br/><br/>
			If you didn't make this request, please ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
			<br/><br/>
			Best wishes,
			<br/>
			The Chaaat Team
		</p>
	`,

  'template-commentPosted-subject-1624117067': 'Pave Message from Buyer',
  'template-commentPosted-body-1624116886': `
		<p>
			Hi [AGENT_FIRST_NAME],
			<br/><br/>
			You've received a new message from [BUYER_FIRST_NAME] as follows:
			<br/><br/>
			[PROPERTY_NAME]
			<br/><br/>
			[MESSAGE]
			<br/><br/>
			Reply [COMMENT_LINK].
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,

  'template-commentPosted-subject-1624117268': 'Pave Message from Agent',
  'template-commentPosted-body-1624117278': `
		<p>
			Hi [BUYER_FIRST_NAME],
			<br/><br/>
			You've received a new message from [AGENT_FIRST_NAME] from [AGENCY_NAME] as follows:
			<br/><br/>
			[PROPERTY_NAME]
			<br/><br/>
			[MESSAGE]
			<br/><br/>
			Reply [COMMENT_LINK].
			<br/><br/>
			Please note this is an automatically generated email and is not monitored for replies.
		</p>
	`,

  'template-shortlisted-property-subject-1624117469':
    'Pave Shortlisted Properties for review',
  'template-shortlisted-property-body-1624117475': `
		<p>
			Hi [BUYER_FIRST_NAME],
			<br/><br/>
			You've received a shortlist of properties to review from [AGENT_FIRST_NAME] from [AGENCY_NAME]:
			<br/><br/>
			Please click on the following link to review a wide range of information about the properties and also provide us any thoughts or comments you may have.
			<br/><br/>
			[PERMALINK]
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
  'template-shortlisted-property-whatsapp-body-1624117475': `
			Hi [BUYER_FIRST_NAME],
			You've received a shortlist of properties to review from [AGENT_FIRST_NAME] from [AGENCY_NAME]:
			Please click on the following link to review a wide range of information about the properties and also provide us any thoughts or comments you may have.
			[PERMALINK]
			Please note this is an automatically generated email and is not monitored for replies.
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
  '2-auth-1608395441003': 'Sorry, failed to verify email.',
  '2-auth-1608484145842': 'Email has already been verified before.',
  '2-auth-1608510138480': 'Invalid email or password provided.',
  '2-auth-1619409641134': 'Failed to find user account via Google',
  '2-auth-1619409815992': 'Failed to find user account via Facebook',

  '1-agency-1622176002': 'Retrieved list of agencies successfully.',
  '1-agency-1622176515': 'Retrieved agency record successfully.',
  '1-agency-1622178043': 'Agency record created successfully.',
  '1-agency-1622181696': 'Agency record updated successfully.',
  '1-agency-1622182797': 'Agency record deleted successfully.',
  '2-agency-1622176015': 'Failed to retrieve list of agencies.',
  '2-agency-1622176528': 'Failed to retrieve agency record.',
  '2-agency-1622178049': 'Failed to create agency record.',
  '2-agency-1622181716': 'Failed to update agency record.',
  '2-agency-1622182815': 'Failed to delete agency record.',

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

  '1-hubspot-contact-1634121067394': 'Successfully retrieved HubSpot contacts',
  '1-hubspot-contact-1630588832':
    'Successfully initiated request for HubSpot integration',
  '1-hubspot-contact-1634465128538':
    'Successfully connected to your HubSpot account',
  '2-hubspot-contact-1634465128538':
    'Failed to connect your HubSpot account. Please try again',
  '2-hubspot-contact-1634121067394': 'Failed to retrieve HubSpot contacts',
  '2-hubspot-contact-1630588832':
    'Failed to initiate request for HubSpot Integration',

  '1-salesforce-contact-1636813061226':
    'Successfully retrieved Salesforce contacts',
  '2-salesforce-contact-1636813061226':
    'Failed to retrieve Salesforce contacts',
  '1-salesforce-contact-1636817693755': 'Full Salesforce sync triggered',
  '2-salesforce-contact-1636817693755':
    'Failed to trigger Salesforce full sync',
  '1-salesforce-missing-contacts-sync-1655867033578':
    'Missing contacts successfully synced.',
  '2-salesforce-missing-contacts-sync-1655867033578':
    'Missing contacts failed to sync.',
  '1-tray-contact-1634288136019': 'Full HubSpot sync triggered',
  '1-tray-contact-1633607552147': 'Sucessfully created hubspot contact in pave',
  '1-tray-contact-1639494210319': 'Sucessfully updated hubspot contact in pave',
  '1-tray-contact-1641986001507':
    'Successfully updated salesforce contact in pave',
  '1-tray-contact-1634121378394':
    'Successfully ran full sync of HubSpot contacts in pave',
  '1-tray-contact-1636986909594':
    'Successfully ran full sync of Salesforce contacts in pave',
  '2-tray-contact-1633607552147': 'Failed to create hubspot contact in pave',
  '2-tray-contact-1639494210319': 'Failed to update hubspot contact in pave',
  '2-tray-contact-1641986001507': 'Failed to update salesforce contact in pave',
  '2-tray-contact-1634121378394':
    'Failed full sync of HubSpot contacts in pave',
  '2-tray-contact-1636986909594':
    'Failed full sync of Salesforce contacts in pave',
  '2-tray-contact-1634288136019': 'Failed to trigger full HubSpot sync',

  '1-tray-integration-1634528025482': 'Fetched agency user active integrations',
  '1-tray-integration-1636268343136':
    'Successfully initiated request for integration',
  '1-tray-integration-1634530418052':
    'Successfully disconnected from integration',
  '2-tray-integration-1634528025482':
    'Failed to fetch agency user active integrations',
  '2-tray-integration-1634530418052': 'Failed to disconnect from integration',
  '2-tray-integration-1636268343136': 'Integration request failed',

  '1-contactLink-1622566911583': 'Deleted contact link successfully.',
  '1-contactLink-1621773084': 'Retrieved contact links successfully.',
  '1-contactLink-1621772306': 'Created contact link successfully.',
  '1-contactLink-1624469170895': 'Updated contact link successfully.',
  '1-contactLink-1623032712200':
    'Retrieved list of possible duplicate contact links successfully.',
  '2-contactLink-1622566930484': 'Failed to delete contact link.',
  '2-contactLink-1621773105': 'Failed to retrieve contact links.',
  '2-contactLink-1621772321': 'Failed to create contact link.',
  '2-contactLink-1624469211980': 'Failed to update contact link.',
  '2-contactLink-1623032742565':
    'Failed to retrieve list of possible duplicate contact links.',

  '1-contact-activity-1623812368': 'Successfully created contact activity.',
  '1-contact-activity-1623818234': 'Successfully retrieved contact activities.',
  '2-contact-activity-1623812377': 'Failed to create contact activity.',
  '2-contact-activity-1623818245': 'Failed to retrieve contact activities.',

  '1-shortlisted-property-1621349511': 'Shortlist property successful.',
  '1-shortlisted-property-1621391826':
    'Shortlisted property rated successfully.',
  '2-shortlisted-property-1621349572': 'Failed to shortlist property.',
  '2-shortlisted-property-1621349599': 'Shortlisted property already exist.',
  '2-shortlisted-property-1621391818': 'Failed to rate shortlist property.',
  '2-shortlisted-property-1621756437079':
    'Invalid property rating range provided.',

  '1-shortlisted-property-comment-1621785761283':
    'Created comment successfully.',
  '1-shortlisted-property-comment-1624292423648':
    'Created comment successfully but unit does not exist anymore so no email notifications will be sent to anyone.',
  '1-shortlisted-property-comment-1621787533608':
    'Retrieved comments successfully.',
  '2-shortlisted-property-comment-1621785808783': 'Failed to create comment.',
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
  '2-project-1622567775252': 'Failed to retrieve projects.',
  '2-project-1624940653': 'Failed to retrieve project.',
  '2-project-1624941331': 'Failed to create project.',
  '2-project-1624941870': 'Failed to update project.',
  '2-project-1624942956': 'Failed to delete project.',

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

  // direct integrations
  '1-hubspot-direct-integration-initialize-1663065971':
    'Successfully initialized Hubspot integration.',
  '2-hubspot-direct-integration-initialize-1663065971':
    'Failed to initialize Hubspot integration.',
  '1-hubspot-direct-integration-complete-1663065971':
    'Hubspot integration successful.',
  '2-hubspot-direct-integration-complete-1663065971':
    'Hubspot integration failed.',
  '1-hubspot-direct-integration-active-integrations-1663065971':
    'Retrieved Hubpost active integrations succesfully.',
  '2-hubspot-direct-integration-active-integrations-1663065971':
    'Retrieving Hubpost active integrations failed.',
  '1-hubspot-direct-integration-delete-active-integrations-1663065971':
    'Hubpost active integrations succesfully deleted.',
  '2-hubspot-direct-integration-delete-active-integrations-1663065971':
    'Hubpost active integrations deletion failed.',

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
  'template-whatsapp-interaction-subject-single-project-1639636972368': `[CONTACT_NAME] would like you to contact them about [PROJECT]`,
  'template-whatsapp-interaction-subject-multiple-project-1639636972368': `[CONTACT_NAME] would like you to contact them about a Proposal`,
  'template-whatsapp-interaction-email-body-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] would like you to reach out to them about the proposal with the below [PRODUCT_OR_PROJECT](s):
    <br/>
    [PROJECT_LIST]
    <br/>
    WhatsApp Message Content:
    <br/><br/>
    <i>[REPLY_MSG]</i>
    <br/><br/>
    Click the button below to start a whatsapp conversation with them.
		<br/><br/>
		<a href="https://staff.chaaat.io/inbox?chat_id=[CHAT_ID]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
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
  'template-whatsapp-interaction-subject-confirmation-1639636972368': `[CONTACT_NAME] has responded on the confirmation reminder about [EVENT]`,
  'template-whatsapp-interaction-email-body-confirmation-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] has [CONFIRMATION] attendance for the <strong>[EVENT]</strong> event [EVENT_DETAILS].
    <br/><br/>
    Thank you!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>
  `,
  'template-whatsapp-user-interaction-subject-user-initiated-1639636972368': `[CONTACT_NAME] started a conversation`,
  'template-whatsapp-user-interaction-subject-user-message-1639636972368': `[CONTACT_NAME] sent a message`,
  'template-whatsapp-user-interaction-email-body-user-initiated-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] has initiated a conversation.
    <br/>
    <br/>
    WhatsApp Message Content:
    <br/><br/>
    <i>[REPLY_MSG]</i>
    <br/><br/>
    Click the button below to start a whatsapp conversation with them.
		<br/><br/>
		<a href="https://staff.chaaat.io/inbox?chat_id=[CHAT_ID]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
      Start WhatsApp Conversation
    </a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>`,
  'template-whatsapp-user-interaction-email-body-user-message-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] has sent a message.
    <br/>
    <br/>
    WhatsApp Message Content:
    <br/><br/>
    <i>[REPLY_MSG]</i>
    <br/><br/>
    Click the button below to start a whatsapp conversation with them.
		<br/><br/>
		<a href="https://staff.chaaat.io/inbox?chat_id=[CHAT_ID]" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
      Start WhatsApp Conversation
    </a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>`,
  'template-livechat-interaction-subject-1639636972368': `[CONTACT_NAME] sent a live chat message`,
  'template-livechat-interaction-email-body-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] has sent a live chat message.
    <br/>
    <br/>
    Message Content:
    <br/><br/>
    <i>[MESSAGE]</i>
    <br/><br/>
    Click the button below to start a conversation with them.
		<br/><br/>
		<a href="https://staff.chaaat.io/inbox" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
      Start Live Chat Conversation
    </a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>`,
  'template-line-interaction-subject-1639636972368': `[CONTACT_NAME] sent a Line message`,
  'template-line-interaction-email-body-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] has sent a Line message.
    <br/>
    <br/>
    Message Content:
    <br/><br/>
    <i>[MESSAGE]</i>
    <br/><br/>
    Click the button below to start a conversation with them.
		<br/><br/>
		<a href="https://staff.chaaat.io/inbox" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
      Start Line Conversation
    </a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>`,
  'template-fbmessenger-interaction-subject-1639636972368': `[CONTACT_NAME] sent a message via FB Messenger`,
  'template-fbmessenger-interaction-email-body-1651855722401': `
  <p style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif">
    <img src="https://pave-prd.s3-ap-southeast-1.amazonaws.com/assets/chaaat-dark.png" alt="" width="150"/>
    <br/><br/>
    Hi [AGENT_FIRST_NAME],
    <br/><br/>
    [CONTACT_NAME] has sent a message via FB Messenger.
    <br/>
    <br/>
    Message Content:
    <br/><br/>
    <i>[MESSAGE]</i>
    <br/><br/>
    Click the button below to start a conversation with them.
		<br/><br/>
		<a href="https://staff.chaaat.io/inbox" class="btn-primary" itemprop="url" style="font-family: 'Fira Sans',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block;border-radius: 3px; background: rgb(60,166,229); background: linear-gradient(90deg, rgba(60,166,229,1) 0%, rgba(72,119,255,1) 50%, rgba(140,99,225,1) 100%); padding: 10px; margin: 0px">
      Start Messenger Conversation
    </a>
    <br/><br/>
    Happy Selling!
    <br/>
    The Chaaat Team
    <br/><br/>
    Please note this is an automatically generated email and is not monitored for replies.
  </p>`,
  '2-subscription-1688322115':
    'Not allowed to send message: No active subscriptions found',
  '2-not-allowed-to-send-whatsapp-message-1688322115':
    'Not allowed to send message',
  '2-no-message-credits-1688322115':
    'Not allowed to send message: No more trial credits',
  '2-subscription-expired-1688322115':
    'Not allowed to send message: Current subscription expired',
  '2-subscription-contact-1688322115':
    'Not allowed to add contact: No active subscriptions found',
  '2-contact-limit-1688322115':
    'Not allowed to add contact: Contact limit reached',
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
};
