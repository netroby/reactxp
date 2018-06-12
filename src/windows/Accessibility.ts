/**
* Accessibility.ts
*
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT license.
*/

import RN = require('react-native');
import { Accessibility as NativeAccessibility, default as parentInstance } from '../native-common/Accessibility';

export class Accessibility extends NativeAccessibility {
    // Work around the fact that the public react-native type definition doesn't
    // include initialHighContrast in RN.AccessibilityInfoStatic.
    private _isHighContrast = (RN.AccessibilityInfo as
        RN.ExtendedAccessibilityInfoStatic).initialHighContrast || false;

    constructor() {
        super();

        // Work around the fact that the public react-native type definition doesn't
        // include 'highContrastDidChange' in RN.AccessibilityEventName.
        RN.AccessibilityInfo.addEventListener('highContrastDidChange' as RN.AccessibilityEventName,
                (isEnabled: boolean) => {
            this._updateIsHighContrast(isEnabled);
        });
    }

    private _updateIsHighContrast(isEnabled: boolean) {
        if (this._isHighContrast !== isEnabled) {
            this._isHighContrast = isEnabled;
            this.highContrastChangedEvent.fire(isEnabled);
        }
    }

    isHighContrastEnabled(): boolean {
        return this._isHighContrast;
    }

    announceForAccessibility(announcement: string): void {
        // We cannot just call super.announceForAccessibility here, because RootView subscribes on this
        // parent class singleton instance. Calling Accessibility.announceForAccessibility from the consumer app
        // will then create a different event and the announcements won't work. Instead, we just call the
        // instance method directly.
        //
        // This dirty hack was copied from android/Accessibility.ts but it's temporary.
        // TODO: Decide on which pattern to use for "extending"/"inheriting" classes while not
        // having problem with duplicate state like here. And then replace this dirty hack (and all the other
        // bugs in existing code - this class and others) with proper pattern.
        parentInstance.announceForAccessibility(announcement);
    }
}

export default new Accessibility();
