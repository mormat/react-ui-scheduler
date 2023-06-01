/**
 * @jest-environment jsdom
 */

import {render, screen, fireEvent, act} from '@testing-library/react'
import '@testing-library/jest-dom';
require('jest-mock-now')(new Date('2023-04-20'));

import Header from '../src/Header';

describe('Header', () => {

    test("Default date", async() => {
        
        const onDateChange = jest.fn();
        
        const { container } = render(
            <Header onDateChange = { onDateChange } />
        );

        const todayBtn    = screen.getByText("today");
        const previousBtn = screen.getByText("<");
        const nextBtn     = screen.getByText(">");
        
        nextBtn.click();        
        expect(onDateChange).toHaveBeenLastCalledWith(new Date('2023-04-27'));
        
        nextBtn.click();        
        expect(onDateChange).toHaveBeenLastCalledWith(new Date('2023-05-04'));
        
        todayBtn.click();        
        expect(onDateChange).toHaveBeenLastCalledWith(new Date('2023-04-20'));
        
        previousBtn.click();        
        expect(onDateChange).toHaveBeenLastCalledWith(new Date('2023-04-13'));
        
        previousBtn.click();        
        expect(onDateChange).toHaveBeenLastCalledWith(new Date('2023-04-06'));
    });
    
    test("Default date", async() => {
        
        const onDateChange = jest.fn();
        
        const { container } = render(
            <Header date="2023-04-30" onDateChange = { onDateChange } />
        );

        const todayBtn    = screen.getByText("today");
        const previousBtn = screen.getByText("<");
        const nextBtn     = screen.getByText(">");
        
        nextBtn.click();        
        expect(onDateChange).toHaveBeenLastCalledWith(new Date('2023-05-07'));
        
        previousBtn.click();        
        expect(onDateChange).toHaveBeenLastCalledWith(new Date('2023-04-30'));
        
    });
    
});
