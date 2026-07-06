import * as vscode from "vscode";
import { getAgentPrompt } from "../utils/osLoader";

export async function generateFeature() {
  const plannerContext = getAgentPrompt("planner");
  const builderContext = getAgentPrompt("builder");
  
  console.log(`[MADSuite OS] Planner rules loaded: ${plannerContext.length} chars`);
  console.log(`[MADSuite OS] Builder rules loaded: ${builderContext.length} chars`);

  const name = await vscode.window.showInputBox({
    prompt: "CRUD entity name (e.g. clients, invoices)",
  });

  if (!name) return;

  const entity = name.toLowerCase();
  const Entity = entity.charAt(0).toUpperCase() + entity.slice(1);

  const code = generateFullCRUD(entity, Entity);

  // Ouvrir un document avec le code généré (comportement existant)
  // NOTE: le code généré évite crypto côté runtime serveur.

  const doc = await vscode.workspace.openTextDocument({
    content: code,
    language: "typescript",
  });

  await vscode.window.showTextDocument(doc);

  vscode.window.showInformationMessage(`⚙️ CRUD generated: ${entity}`);
}

function generateSaaSModule(name: string, ClassName: string) {
  return `
// ===============================
// MADSuite Feature Module: ${name}
// ===============================

// 🧠 SERVICE LAYER
export class ${ClassName}Service {
  
  async create(data: any) {
    const id = String(Math.random()) + String(Date.now());
    return {
      id,
      ...data,
      createdAt: new Date()
    };
  }

  async findAll() {
    return [];
  }
}

// ===============================
// 🌐 CONTROLLER / ROUTE
import { Router } from "express";

export const ${name}Router = Router();
const service = new ${ClassName}Service();

${name}Router.post("/", async (req, res) => {
  const result = await service.create(req.body);
  res.json(result);
});

${name}Router.get("/", async (req, res) => {
  const result = await service.findAll();
  res.json(result);
});

// ===============================
// 🧩 NOTES
// - Multi-tenant ready (add userId filter later)
// - Extend service for business logic
// - Plug into Express app with app.use("/${name}", router)
`;
}

function generateFullCRUD(entity: string, Entity: string) {
  return `
// ===============================
// MADSuite FULL CRUD MODULE: ${entity}
// ===============================

import { Router } from "express";

// ===============================
// 🧠 SERVICE LAYER
class ${Entity}Service {

  async create(data: any, userId?: string) {
    const id = String(Math.random()) + String(Date.now());
    return {
      id,
      userId,
      ...data,
      createdAt: new Date()
    };
  }

  async findAll(userId?: string) {
    return [];
  }

  async findOne(id: string, userId?: string) {
    return { id, userId };
  }

  async update(id: string, data: any, userId?: string) {
    return { id, ...data, userId };
  }

  async delete(id: string, userId?: string) {
    return { success: true };
  }
}

const service = new ${Entity}Service();

// ===============================
// 🌐 ROUTER (API)
export const ${entity}Router = Router();

// CREATE
${entity}Router.post("/", async (req, res) => {
  const result = await service.create(req.body, req.user?.id);
  res.json(result);
});

// READ ALL
${entity}Router.get("/", async (req, res) => {
  const result = await service.findAll(req.user?.id);
  res.json(result);
});

// READ ONE
${entity}Router.get("/:id", async (req, res) => {
  const result = await service.findOne(req.params.id, req.user?.id);
  res.json(result);
});

// UPDATE
${entity}Router.put("/:id", async (req, res) => {
  const result = await service.update(
    req.params.id,
    req.body,
    req.user?.id
  );
  res.json(result);
});

// DELETE
${entity}Router.delete("/:id", async (req, res) => {
  const result = await service.delete(req.params.id, req.user?.id);
  res.json(result);
});

// ===============================
// 🧩 NOTES
// - Multi-tenant ready via userId
// - Replace memory storage with Prisma later
// - Plug: app.use("/${entity}", ${entity}Router)
`;
}

function generatePrismaModel(Entity: string) {
  return `
model ${Entity} {
  id        String   @id @default(uuid())
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

// export async function generateFeature() {
//   const editor = vscode.window.activeTextEditor;
//   if (!editor) {
//     vscode.window.showErrorMessage("No active editor");
//     return;
//   }

//   const featureName = await vscode.window.showInputBox({
//     prompt: "Feature name (e.g. invoices, clients, projects)",
//   });

//   if (!featureName) return;

//   const className = featureName.charAt(0).toUpperCase() + featureName.slice(1);

//   const code = generateSaaSModule(featureName, className);

//   const file = await vscode.workspace.openTextDocument({
//     content: code,
//     language: "typescript",
//   });

//   await vscode.window.showTextDocument(file);

//   vscode.window.showInformationMessage(`⚙️ Feature '${featureName}' generated`);
// }

// import * as vscode from "vscode";

// export async function generateFeature() {
//   const editor = vscode.window.activeTextEditor;

//   if (!editor) {
//     vscode.window.showErrorMessage("No active editor");
//     return;
//   }

//   const snippet = `
// /**
//  * MADSuite Feature
//  * Generated locally
//  */

// export function newFeature() {
//   // TODO: implement business logic
// }
// `;

//   await editor.edit((editBuilder) => {
//     editBuilder.insert(editor.selection.active, snippet);
//   });

//   vscode.window.showInformationMessage("⚙️ Feature generated");
// }
