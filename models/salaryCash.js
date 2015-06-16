/**
 * Created by soundstorm on 16.06.15.
 */
module.exports = (function () {
    var mongoose = require('mongoose');
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var salaryCashSchema = new mongoose.Schema({
        dataKey: String,
        month: Number,
        year: Number,
        calc: {
            salary: Number,
            onCash: Number,
            onCard: Number
        },
        paid: {
            onCash: Number,
            onCard: Number
        },
        diff: {
            onCash: Number,
            onCard: Number
        },
        employeesArray: [{
            ID: Number,
            employee: {
                _id: {type: ObjectId, ref: 'Employees', default: null},
                name: String
            },
            baseSalary: Number,
            hourlyWithExpense: Number,
            calc: {
                salary: Number,
                onCash: Number,
                onCard: Number,
                onBonus: Number
            },
            paid: {
                onCash: Number,
                onCard: Number,
                onBonus: Number
            },
            diff: {
                onCash: Number,
                onCard: Number,
                onBonus: Number
            }
        }]

    }, {collection: 'SalaryCash'});

    salaryCashSchema.set('toJSON', {virtuals: true});

    mongoose.model('SalaryCash', salaryCashSchema);

    if (!mongoose.Schemas) {
        mongoose.Schemas = {};
    }

    mongoose.Schemas['SalaryCash'] = salaryCashSchema;
})();