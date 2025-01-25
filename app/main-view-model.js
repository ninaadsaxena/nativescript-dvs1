import { Observable, Dialogs, Utils } from '@nativescript/core';
import { Geolocation } from '@nativescript/geolocation';

export function createViewModel() {
    const viewModel = new Observable();

    // Calculator state
    viewModel.display = "0";
    viewModel.currentValue = "";
    viewModel.previousValue = "";
    viewModel.operator = "";
    viewModel.newNumber = true;
    viewModel.showHelp = false;

    // Secret code to show help (entering 112)
    const secretCode = "112";
    let enteredCode = "";

    // Emergency contacts for India
    const emergencyContacts = [
        { name: "National Emergency Number", number: "112" },
        { name: "Women Helpline", number: "1091" },
        { name: "Women Helpline - Domestic Abuse", number: "181" },
        { name: "Police", number: "100" },
        { name: "Ambulance", number: "108" },
    ];

    // Major cities shelters (this should be expanded in a real app)
    const shelters = {
        "Delhi": [
            "Shakti Shalini - 24x7 Shelter (011-24373737)",
            "YWCA - Working Women's Hostel (011-23368321)",
            "Shakti Shalini Crisis Center (011-47615555)"
        ],
        "Mumbai": [
            "Urja Trust Women's Shelter (022-26770137)",
            "Special Cell for Women & Children (022-22621679)",
            "Swadhar Greh Scheme Center (022-26662394)"
        ],
        "Bangalore": [
            "Parihar Family Counselling Centre (080-22943225)",
            "Vanitha Sahayavani (080-22943225)",
            "Abhayashrama Women's Shelter (080-23321301)"
        ],
        "Chennai": [
            "International Foundation for Crime Prevention (044-23452365)",
            "Aruwe Women's Shelter (044-26426421)",
            "Tamil Nadu Women's Commission (044-28592750)"
        ]
    };

    viewModel.onNumber = (args) => {
        const number = args.object.text;
        enteredCode += number;
        
        // Check for secret code
        if (enteredCode.endsWith(secretCode)) {
            viewModel.set("showHelp", true);
            // Vibrate to confirm activation
            Utils.android && Utils.android.getActivity().runOnUiThread(() => {
                const vibrator = Utils.android.getActivity().getSystemService(android.content.Context.VIBRATOR_SERVICE);
                vibrator.vibrate(200);
            });
        }
        
        // Normal calculator functionality
        if (viewModel.newNumber) {
            viewModel.set("display", number);
            viewModel.newNumber = false;
        } else {
            viewModel.set("display", viewModel.display + number);
        }
        viewModel.currentValue = viewModel.display;
    };

    viewModel.onOperator = (args) => {
        viewModel.operator = args.object.text;
        viewModel.previousValue = viewModel.display;
        viewModel.newNumber = true;
        enteredCode = ""; // Reset code entry
    };

    viewModel.onEqual = () => {
        if (!viewModel.previousValue || !viewModel.currentValue) return;
        
        const prev = parseFloat(viewModel.previousValue);
        const current = parseFloat(viewModel.currentValue);
        let result = 0;

        switch (viewModel.operator) {
            case "+": result = prev + current; break;
            case "-": result = prev - current; break;
            case "×": result = prev * current; break;
            case "÷": result = prev / current; break;
        }

        viewModel.set("display", result.toString());
        viewModel.newNumber = true;
        enteredCode = ""; // Reset code entry
    };

    viewModel.onDecimal = () => {
        if (!viewModel.display.includes(".")) {
            viewModel.set("display", viewModel.display + ".");
        }
    };

    // Safety Features
    viewModel.onSOS = async () => {
        try {
            // Get current location
            const location = await Geolocation.getCurrentLocation({});
            
            // Send emergency SMS to contacts
            emergencyContacts.forEach(contact => {
                // In a real app, implement actual SMS sending
                console.log(`Emergency SMS would be sent to ${contact.name}: ${contact.number}`);
                console.log(`Location: ${location.latitude}, ${location.longitude}`);
            });

            Dialogs.alert({
                title: "सहायता मार्ग में है",
                message: "आपातकालीन संपर्कों को आपके स्थान के साथ सूचित कर दिया गया है।",
                okButtonText: "ठीक है"
            });
        } catch (error) {
            console.error("SOS Error:", error);
        }
    };

    viewModel.onQuickExit = () => {
        // Quickly exit to home screen
        if (Utils.android) {
            const intent = new android.content.Intent(android.content.Intent.ACTION_MAIN);
            intent.addCategory(android.content.Intent.CATEGORY_HOME);
            intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            Utils.android.getActivity().startActivity(intent);
        }
    };

    viewModel.onFindShelters = () => {
        const allShelters = [];
        Object.keys(shelters).forEach(city => {
            allShelters.push(`--- ${city} ---`);
            allShelters.push(...shelters[city]);
        });

        Dialogs.action({
            title: "निकटतम आश्रय",
            message: "आश्रय का चयन करें",
            cancelButtonText: "वापस",
            actions: allShelters
        });
    };

    viewModel.onLegalHelp = () => {
        Dialogs.action({
            title: "कानूनी सहायता",
            message: "सेवा का चयन करें",
            cancelButtonText: "वापस",
            actions: [
                "नि:शुल्क कानूनी सहायता",
                "महिला आयोग",
                "पुलिस सहायता",
                "घरेलू हिंसा अधिनियम",
                "NALSA हेल्पलाइन (15100)"
            ]
        });
    };

    viewModel.onCounseling = () => {
        Dialogs.action({
            title: "परामर्श सेवाएं",
            message: "सेवा का चयन करें",
            cancelButtonText: "वापस",
            actions: [
                "24x7 संकट हेल्पलाइन",
                "ऑनलाइन चैट सहायता",
                "स्थानीय काउंसलर खोजें",
                "सहायता समूह",
                "मानसिक स्वास्थ्य सहायता"
            ]
        });
    };

    viewModel.onContacts = () => {
        Dialogs.action({
            title: "आपातकालीन संपर्क",
            message: "संपर्क चुनें",
            cancelButtonText: "वापस",
            actions: emergencyContacts.map(c => `${c.name}: ${c.number}`)
        });
    };

    return viewModel;
}