/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNotificationMessage = /* GraphQL */ `
  query GetNotificationMessage($id: ID!, $type: String!) {
    getNotificationMessage(id: $id, type: $type) {
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
export const listNotificationMessages = /* GraphQL */ `
  query ListNotificationMessages(
    $filter: TableNotificationMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotificationMessages(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        agencyId
        createdAt
        data
        id
        type
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
