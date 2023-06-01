Feature: Displaying events in the scheduler

  Background:
    Given the following events are scheduled
      | date       | startTime | endTime | label           |
      | 2023-05-01 | 10:00     | 12:00   | Presentation    |
      | 2023-05-05 | 14:00     | 16:00   | Meeting         |
      | 2023-05-07 |  9:00     | 10:00   | Medical checkup |
      | 2023-04-28 |  9:00     | 18:00   | Training course |
      | 2023-05-09 | 11:00     | 12:00   | Job Interview   |


  Scenario: Displaying events for current week    
    Given the date today is "2023-05-01"
    When I open the scheduler
    Then only the items checked below should be visible
      | Presentation    | X |
      | Meeting         | X |  
      | Medical checkup | X |  
      | Job Interview   |   |
      | Training course |   |  
     
  Scenario: Displaying events for next week
    Given the date today is "2023-05-01"
    When I open the scheduler
    And I click on "Next week"
    Then only the items checked below should be visible
      | Presentation    |   |
      | Meeting         |   |  
      | Medical checkup |   |  
      | Job Interview   | X |
      | Training course |   |  

  Scenario: Displaying events for previous week
    Given the date today is "2023-05-01"
    When I open the scheduler
    And I click on "Previous week"
    Then only the items checked below should be visible
      | Presentation    |   |
      | Meeting         |   |  
      | Medical checkup |   |  
      | Job Interview   |   |
      | Training course | X |  
