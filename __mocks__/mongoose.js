const createObjectId = (() => {
  let counter = 0;
  return (value) => {
    // Generate unique IDs when no value is provided
    const id = value ?? `507f1f77bcf86cd7994390${String(counter++).padStart(2, '0')}`;
    return {
      value: id,
      toString() {
        return id;
      },
      equals(other) {
        return this.value === (other?.value || other?.toString() || other);
      }
    };
  };
})();

class ObjectId {
  constructor(value) {
    const instance = createObjectId(value);
    this.value = instance.value;
    this.toString = instance.toString.bind(instance);
    this.equals = instance.equals.bind(instance);
  }

  static isValid(value) {
    if (!value) return false;
    if (typeof value === 'string') {
      return /^[0-9a-fA-F]{24}$/.test(value);
    }
    return value instanceof ObjectId;
  }
}

const Types = {
  ObjectId,
  Mixed: {},
  String: String,
  Number: Number,
  Date: Date,
  Boolean: Boolean,
  Array: Array,
  Buffer: Buffer,
  Map: Map,
};

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.statics = {};
    this.virtuals = {};
  }

  index() {
    return this;
  }

  virtual(name) {
    const virtual = {
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };
    this.virtuals[name] = virtual;
    return virtual;
  }

  pre(hook, fn) {
    return this;
  }

  post(hook, fn) {
    return this;
  }
}

Schema.Types = Types;

const mockModel = (modelName) => {
  const Model = jest.fn().mockImplementation(function(doc) {
    this._doc = doc || {};
    this._id = doc?._id || new ObjectId();
    this.isNew = !doc?._id;

    // Copy properties from doc
    Object.keys(this._doc).forEach(key => {
      this[key] = this._doc[key];
    });

    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue(this._doc);
    this.toJSON = jest.fn().mockReturnValue(this._doc);
    this.populate = jest.fn().mockReturnThis();
  });

  // Static methods
  Model.find = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  });

  Model.findOne = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
  });

  Model.findById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
  });

  Model.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
  Model.findByIdAndDelete = jest.fn().mockResolvedValue(null);
  Model.findOneAndUpdate = jest.fn().mockResolvedValue(null);
  Model.findOneAndDelete = jest.fn().mockResolvedValue(null);
  Model.create = jest.fn().mockResolvedValue(new Model());
  Model.insertMany = jest.fn().mockResolvedValue([]);
  Model.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });
  Model.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
  Model.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 0 });
  Model.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 0 });
  Model.countDocuments = jest.fn().mockResolvedValue(0);
  Model.distinct = jest.fn().mockResolvedValue([]);

  Model.aggregate = jest.fn().mockReturnValue({
    match: jest.fn().mockReturnThis(),
    group: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    project: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  });

  return Model;
};

const models = {};

const model = jest.fn((name, schema) => {
  if (!schema) {
    return models[name] || mockModel(name);
  }
  models[name] = mockModel(name);
  return models[name];
});

const connection = {
  on: jest.fn(),
  once: jest.fn(),
  close: jest.fn().mockResolvedValue(undefined),
  readyState: 1,
  db: {
    collection: jest.fn(),
  },
};

const mongoose = {
  Types,
  Schema,
  models,
  model,
  set: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn().mockResolvedValue(undefined),
  connection,
  startSession: jest.fn().mockResolvedValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
  }),
};

// Now set up the mock resolved value after mongoose is defined
mongoose.connect.mockResolvedValue(mongoose);

// Support both CommonJS and ES module imports
module.exports = mongoose;
module.exports.default = mongoose;
