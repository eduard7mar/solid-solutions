document.addEventListener("DOMContentLoaded", function () {
  // Восстановление дерева из LocalStorage при загрузке страницы
  restoreTree();

  document.getElementById("createRoot").addEventListener("click", function () {
    createNode("Root", null);
  });
});

function createNode(text, parentId) {
  const treeContainer = document.getElementById("treeContainer");

  // Уникальный ID для нового узла
  const nodeId = Date.now().toString();
  const node = document.createElement("div");
  node.classList.add("node", "ml-3", "mt-3");
  node.id = nodeId;

  if (parentId !== null) {
    node.dataset.parentId = parentId;
  }

  const nodeContent = document.createElement("span");
  nodeContent.textContent = text;

  const toggleBtn = document.createElement("button");
  toggleBtn.innerHTML = "►";
  toggleBtn.classList.add("btn", "btn-toggle", "btn-sm", "mr-2");

  toggleBtn.style.visibility = "hidden";

  // Обработчик клика на кнопку сворачивания/разворачивания
  toggleBtn.onclick = function () {
    const childNodes = Array.from(node.querySelectorAll(":scope > .node"));
    const isExpanded = toggleBtn.textContent === "▼";

    childNodes.forEach((child) => {
      child.style.display = isExpanded ? "none" : "block";
    });

    toggleBtn.textContent = isExpanded ? "►" : "▼";
  };

  // Добавляем кнопку сворачивания/разворачивания перед содержимым узла
  node.prepend(toggleBtn);

  const addBtn = document.createElement("button");
  addBtn.innerHTML = "+";
  addBtn.classList.add("btn", "btn-success", "btn-sm", "ml-2");
  addBtn.onclick = function () {
    createNode("New node", nodeId);
    if (toggleBtn.style.visibility === "hidden") {
      toggleBtn.style.visibility = "visible";
      toggleBtn.innerHTML = "▼";
    }
};

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "-";
  removeBtn.classList.add("btn", "btn-danger", "btn-sm", "ml-2");
  removeBtn.onclick = function () {
    removeNodeAndChildren(nodeId); // Удаляем узел и его потомков

    const parentNode = parentId ? document.getElementById(parentId) : null;
    if (parentNode && !parentNode.querySelector(".node")) {
      // Проверяем наличие дочерних узлов
      const parentToggleBtn = parentNode.querySelector(".btn-toggle");
      if (parentToggleBtn) {
        parentToggleBtn.style.visibility = "hidden"; // Скрываем кнопку-стрелку
        parentToggleBtn.innerHTML = "►"; // Меняем обратно на горизонтальную стрелку
      }
    }
  };

  node.appendChild(nodeContent);
  node.appendChild(addBtn);
  node.appendChild(removeBtn);

  if (parentId === null) {
    treeContainer.appendChild(node);
  } else {
    document.getElementById(parentId).appendChild(node);
  }

  saveTree(); // Сохраняем дерево после каждого изменения
}


function removeNodeAndChildren(nodeId) {
  const node = document.getElementById(nodeId);
  if (node.dataset.parentId) {
    const parentNode = document.getElementById(node.dataset.parentId);
    parentNode.removeChild(node);
  } else {
    node.remove();
  }
  saveTree(); // Сохраняем дерево после удаления узла
}

function saveTree() {
  const treeContainer = document.getElementById("treeContainer");
  localStorage.setItem("tree", treeContainer.innerHTML); // Сохраняем HTML дерева
}

function restoreTree() {
  const treeContainer = document.getElementById("treeContainer");
  const savedTree = localStorage.getItem("tree");
  if (savedTree) {
    treeContainer.innerHTML = savedTree;
    // Переназначаем события для кнопок после восстановления дерева
    reassignEvents(treeContainer);

    // Обновляем состояние кнопок-стрелок
    updateToggleButtons(treeContainer);
  }
}

function updateToggleButtons(parentElement) {
  const toggleButtons = parentElement.getElementsByClassName("btn-toggle");

  Array.from(toggleButtons).forEach((toggleBtn) => {
    const node = toggleBtn.closest(".node");
    const childNodes = node.querySelectorAll(":scope > .node");

    // Устанавливаем видимость стрелок в зависимости от наличия дочерних узлов
    if (childNodes.length > 0) {
      toggleBtn.style.visibility = "visible";
      // Проверяем, свернуты ли дочерние узлы
      const isAnyChildVisible = Array.from(childNodes).some(
        (child) => child.style.display !== "none"
      );
      toggleBtn.textContent = isAnyChildVisible ? "▼" : "►";
    } else {
      // Если дочерних элементов нет, скрываем стрелку
      toggleBtn.style.visibility = "hidden";
    }
  });
}

function reassignEvents(parentElement) {
  const addButtons = parentElement.getElementsByClassName("btn-success");
  const removeButtons = parentElement.getElementsByClassName("btn-danger");
  const toggleButtons = parentElement.getElementsByClassName("btn-toggle");

  Array.from(addButtons).forEach((btn) => {
    btn.onclick = function () {
      createNode("New node", btn.closest(".node").id);
    };
  });

  Array.from(removeButtons).forEach((btn) => {
    btn.onclick = function () {
      removeNodeAndChildren(btn.closest(".node").id);
    };
  });

  Array.from(toggleButtons).forEach((btn) => {
    btn.onclick = function () {
      const node = btn.closest(".node");
      const childNodes = Array.from(node.querySelectorAll(":scope > .node"));
      const isExpanded = btn.textContent === "▼";

      childNodes.forEach((child) => {
        child.style.display = isExpanded ? "none" : "block";
      });

      btn.textContent = isExpanded ? "►" : "▼";
    };

    // Показываем или скрываем кнопку toggle в зависимости от того, есть ли дочерние элементы
    const hasChildNodes = btn.closest(".node").querySelector(":scope > .node");
    btn.style.visibility = hasChildNodes ? "visible" : "hidden";
  });
}
