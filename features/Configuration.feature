Feature: Configuration of the scheduler

  Scenario: Define starting date
    Given the configuration contains:
        | startDate | 2023-05-08 |
    And the date today is "2023-05-01"
    When I open the scheduler
    Then I should see "May 8, 2023"
    And I should not see "May 1, 2023"

  Scenario: Define min and max hours
    Given the configuration contains:
        | minHour | 08 |
        | maxHour | 20 |
    When I open the scheduler
    Then only the items checked below should be visible
        | 00:00 |   |
        | 08:00 | X |
        | 19:00 | X |
        | 20:00 |   |
        | 23:00 |   |
    
  Scenario: Define language
    Given the configuration contains:
        | locale | fr |
    And the date today is "2023-05-01"
    When I open the scheduler
    Then I should see "lun. 1 mai 2023"

  @drag_n_drop
  @pending
  Scenario: 'onEventChanged' event
    Given the following events are scheduled
      | date       | startTime | endTime | label           |
      | 2023-05-01 | 10:00     | 12:00   | Presentation    |
    And the date today is "2023-05-01"
    And the configuration contains:
      | onEventChanged | function() { document.body.innerHTML += "event was moved" } |
    When I open the scheduler
    And I move "Presentation" to ".day-2023-05-02"
    Then I should see "event was moved"

  @drag_n_drop
  Scenario Outline: 'enableOverlapping' property
    Given the following events are scheduled
      | date       | startTime | endTime | label         |
      | 2023-05-01 | 10:00     | 12:00   | Meeting       |
      | 2023-05-01 | 16:00     | 18:00   | Presentation  |
    And the date today is "2023-05-01"
    And the configuration contains:
      | enableOverlapping | <overlaps_enabled> |
    When I open the scheduler
    And I move "Meeting" to "Presentation"
    Then I should see "<expected_text>"
    
    Examples:
      | overlaps_enabled | expected_text         |
      | false            | 10:00 - 12:00 Meeting |
      | true             | 16:00 - 18:00 Meeting |
        
