
/** 
 * Creates a signal which can be read, written,
 * event handlers can be added which are called on changes.
 * 
 * Example:
 * 
 *      const currentUser = createSignal();
 *     
 *      currentUser.event(user => 
 *          user.admin ? showAdminPanel() : hideAdminPanel());
 * 
 *      // event handler gets called
 *      currentUser = { id: 13, admin: true };
 *      
 */
export function createSignal<T>(initialValue : T, options : ISignalOptions) : ISignal<T>;


export interface ISignalOptions {
}

/** 
 * Contains a value that can be read, written,
 * event handlers can be added which are called on changes.
 */
export interface ISignal<T>
{
    /** get or set the current value throught this property */
    value: T;
    
    /** reads gets the current value, same as `ISignal.value` */
    read(): T;

    /** sets the current value, same as `ISignal.value = newValue` */
    update(newValue: T) : void;

    /** adds a new change event handler to this signal */
    subscribe: (handler: (value : T) => void) => () => void;

    /** adds a new change event handler to the signal */
    event: (handler: (value : T) => void) => () => void;
}