const DepotRequest = require("../models/DepotRequest.model");
const { withTransaction } = require("../utils/withTransaction");
const { processStockAcceptance } = require("./warehouseStock.service");

const VALID_STATUSES = ["approved", "requested", "accepted"];

exports.updateStatus = async (requestId, payload, user) => {
  return withTransaction(async (session) => {
    const { status, quantity } = payload;

    if (!VALID_STATUSES.includes(status)) {
      const err = new Error("Invalid status");
      err.status = 400;
      throw err;
    }

    const request = await DepotRequest.findById(requestId)
      .populate("warehouseProductId")
      .session(session);

    if (!request) {
      const err = new Error("Depot request not found");
      err.status = 404;
      throw err;
    }

    if (request.status === "accepted") {
      const err = new Error("Request already accepted");
      err.status = 400;
      throw err;
    }

    if (quantity !== undefined) {
      if (quantity <= 0 || quantity > request.quantity) {
        const err = new Error("Invalid quantity");
        err.status = 400;
        throw err;
      }
      request.quantity = quantity;
    }

    request.status = status;
    await request.save({ session });

    if (status === "accepted") {
      await processStockAcceptance(request, user, session);
    }

    return request;
  });
};
