import { createRef, useEffect, useState, Fragment } from 'react';

import { createDragHandler } from './drag-handlers';

import createLayout from './layouts';

import DailyColumnsEvent from './DailyColumnsEvent';

import './DailyColumnsSheet.scss';

const formatDateOptions = {
    weekday: 'short', 
    year:    'numeric', 
    month:   'long', 
    day:     'numeric',
}

function DailyColumnsSheet( { events = [], days = [], hours = [], options = {} } ) {
    
    const [columnsLayout, setColumnsLayout] = useState({});
    const [dragHandler, setDragHandler]     = useState({});
    
    const parentRef    = createRef();
    const { locale = 'en' } = options;
    const { rowHeight = 50 } = options;
    const { draggable = true } = options;
    // const uniqid = Math.random().toString(16).slice(2);
    
    useEffect(() => {
        
        const element = parentRef.current;
        
        const constraints = (days.map((day) => ({
            min: new Date(day + ' ' + hours[0]).getTime(), 
            max: new Date(day + ' ' + hours[hours.length-1]).getTime()
        })));
        
        const resize = () => {
            
            const columnsLayout = createLayout({
                element,
                type: 'columns',
                step: 15 * 60 * 1000
            });
            
            setColumnsLayout(columnsLayout);
            
            if (draggable) {
                
                const dragHandler = createDragHandler({
                    minLength: 15 * 60 * 1000,
                    columnsLayout, 
                }); 
                
                setDragHandler(dragHandler);
            } else {
                setDragHandler(null);
            }
    
        }
        
        resize();
        
        const resizeObserver = new ResizeObserver(() => {
            element.dispatchEvent(new CustomEvent('react-ui-scheduler_resize'));
        });
        resizeObserver.observe(element);
        
        // @todo test that resize event has been removed
        return () => {
            resizeObserver.unobserve(element);
        }
        
    }, []);
    
    return (
        <div>
            { /*
            <Debug columnsLayout= { columnsLayout } />
            { uniqid }
             */ }

            <div ref = { parentRef } 
                 className = "daily-columns-sheet"
                 style = { { position: "relative" } } >

                <table className="react-ui-scheduler-table" 
                       style = { { width: "100%" } } >

                    <thead> 
                        <tr>
                            <td></td>
                            { days.map( ( day, index) => (
                                <th key = { index } >
                                    { new Date(day).toLocaleString(locale, formatDateOptions) }
                                </th>
                            )) }
                        </tr>
                    </thead>

                    <tbody>
                        { hours.slice(0, -1).map( ( hour, index) => (
                            <tr key = { index } style = { { height: rowHeight }}>
                                <th>
                                    { hour }
                                </th>
                                { index === 0 && days.map( (day, index) => (
                                    <td key = { index } 
                                        rowSpan={ hours.length - 1 }
                                        data-datemin= { day + ' ' + hours[0] }
                                        data-datemax= { day + ' ' + hours[hours.length - 1]}
                                    >
                                    </td>
                                )) }
                            </tr>
                        )) }
                    </tbody>

                </table>
                
                <Lines columnsLayout = { columnsLayout }  />

                { events.map( (event, index)  => (
                    <div key = { index }>
                        <DailyColumnsEvent 
                            value   = { event } 
                            onDrop  = { (values) => handleEventDrop(values, event) }
                            draggable = { true }
                            events    = { events }
                            dragHandler = { dragHandler }
                            columnsLayout = { columnsLayout }
                            options = { {...options,  dragHandler} }
                            
                        />
                    </div>
                )) }

            </div>

        </div>
    )
    
}

function Lines( { columnsLayout } )
{
    const [rects, setRects] = useState([]);
        
    const init = () => {
        if (columnsLayout.element) {

            const { element } = columnsLayout;
            const rows  = [...element.querySelectorAll('tbody tr')];

            const parentRect = element.getBoundingClientRect();

            const rects = rows.slice(1).map((element) => {
                const rect = element.getBoundingClientRect();
                
                return {
                    top:   rect.top - parentRect.top,
                    left:  rect.left - parentRect.left,
                    width: rect.width
                }
            });
            
            setRects(rects);
        }
    }
    
    useEffect(() => {
        init();
        
        const { element } = columnsLayout;
        
        if (element) {
            element.addEventListener('react-ui-scheduler_resize', init);
        }
        
        return () => {
            if (element) {
                element.removeEventListener('react-ui-scheduler_resize', init);
            }
        }
    }, [columnsLayout]);
    
    return (
        <Fragment>
        
        { rects.map(({top, left, width}, index) => (
            <div key = { index }
                 style = { {
                    position: "absolute",
                    top, left, width
                 } }
            >
                <div role="separator" />
            </div>
        )) }
        </Fragment>
    )
    
}

function Debug( { columnsLayout } )
{
    const [label, setLabel] = useState('waiting ...');
    
    
    useEffect(() => {

        const n = Math.floor(Math.random() * 100);

        const mousemove = function(e) {
            let label = '???';
            if (columnsLayout) {
                const date = columnsLayout.getValueAtCoord(e);
                label = date.toLocaleString('fr', formatDateOptions + {
                    hour:    'numeric',
                    minute:  'numeric',
                });
            }
            setLabel(label);
        }
        window.addEventListener('mousemove', mousemove);
         
        return () => {
            window.removeEventListener('mousemove', mousemove);
        }
         
    }, [columnsLayout]);
    
    return (
        <h4>{ label }</h4>
    );
}

export default DailyColumnsSheet
    