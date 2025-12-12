/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateNotificationMessage = /* GraphQL */ `
  subscription OnCreateNotificationMessage(
    $agencyId: String
    $createdAt: AWSDateTime
    $data: AWSJSON
    $id: ID
    $type: String
  ) {
    onCreateNotificationMessage(
      agencyId: $agencyId
      createdAt: $createdAt
      data: $data
      id: $id
      type: $type
    ) {
      agencyId
      createdAt
      data
      id
      type
      updatedAt
      __typename
    }
  }
`;
export const onDeleteNotificationMessage = /* GraphQL */ `
  subscription OnDeleteNotificationMessage(
    $agencyId: String
    $createdAt: AWSDateTime
    $data: AWSJSON
    $id: ID
    $type: String
  ) {
    onDeleteNotificationMessage(
      agencyId: $agencyId
      createdAt: $createdAt
      data: $data
      id: $id
      type: $type
    ) {
      agencyId
      createdAt
      data
      id
      type
      updatedAt
      __typename
    }
  }
`;
export const onNotificationMessageByAgencyId = /* GraphQL */ `
  subscription OnNotificationMessageByAgencyId($agencyId: String!) {
    onNotificationMessageByAgencyId(agencyId: $agencyId) {
      agencyId
      createdAt
      data
      id
      type
      updatedAt
      __typename
    }
  }
`;
export const onUpdateNotificationMessage = /* GraphQL */ `
  subscription OnUpdateNotificationMessage(
    $agencyId: String
    $createdAt: AWSDateTime
    $data: AWSJSON
    $id: ID
    $type: String
  ) {
    onUpdateNotificationMessage(
      agencyId: $agencyId
      createdAt: $createdAt
      data: $data
      id: $id
      type: $type
    ) {
      agencyId
      createdAt
      data
      id
      type
      updatedAt
      __typename
    }
  }
`;
